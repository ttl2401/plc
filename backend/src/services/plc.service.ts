import { PlcVariable, IPlcVariable } from '@/models/plc-variable.model';
import { AppError } from '@/middlewares/error.middleware';
import { PLC_CONFIG } from '@/config';

// Import node-snap7 with error handling
let snap7: any;
try {
  snap7 = require('node-snap7');
} catch (error) {
  console.warn('node-snap7 module not found. PLC communication will be simulated.');
  snap7 = null;
}

export class PLCService {
  private client: any;

  constructor() {
    if (snap7) {
      this.client = new snap7.S7Client();
    } else {
      this.client = null;
    }
  }

  /**
   * Get all PLC variables from the database and read current values from PLC
   * @param queries - Query parameters including type filter
   * @returns Promise<IPlcVariable[]> - Array of all PLC variables with current values
   */
  async getVariables(queries: any): Promise<IPlcVariable[]> {
    try {
      const { type } = queries;
      // First, fetch all variables from MongoDB
      const variables = await PlcVariable.find({ type }).sort({ name: 1 });
      
      // Create a copy of the original variables to return if PLC reading fails
      const initialVariables = variables.map(variable => ({ ...variable.toObject() }));
      
      // If no snap7 client available, return initial data
      if (!this.client) {
        console.log('[SIMULATION] Returning MongoDB data without PLC read');
        return variables;
      }
      
      try {
        // Connect to PLC if not already connected
        if (!this.isConnected()) {
          const connectionResult = await this.connectWithTimeout();
          if (!connectionResult) {
            console.warn('Failed to connect to PLC, returning initial MongoDB data');
            return variables;
          }
        }

        // Group variables by DB number and read efficiently
        const dbGroups = this.groupVariablesByDB(variables);
        
        // Read data from each DB group with timeout
        const dbReadResults = await Promise.allSettled(
          Object.entries(dbGroups).map(([dbNumber, dbInfo]) => 
            this.readDBRange(parseInt(dbNumber), dbInfo)
          )
        );

        // Process results and decode individual variable values
        for (const [index, result] of dbReadResults.entries()) {
          const dbNumber = Object.keys(dbGroups)[index];
          const dbInfo = dbGroups[dbNumber];
          
          if (result.status === 'fulfilled' && result.value) {
            // Successfully read DB range, decode individual variables
            for (const variable of dbInfo.variables) {
              try {
                const value = this.decodeVariableFromBuffer(
                  result.value.buffer, 
                  variable, 
                  result.value.startOffset
                );
                
                if (value !== null) {
                  variable.value = value;
                  // Save updated value to database
                  try {
                    await variable.save();
                  } catch (saveError) {
                    console.warn(`Failed to save variable ${variable.name} to database:`, saveError);
                  }
                }
              } catch (decodeError) {
                console.warn(`Failed to decode variable ${variable.name}:`, decodeError);
              }
            }
          } else {
            // Keep original values if DB read failed
            console.warn(`Failed to read DB ${dbNumber}, keeping original values for ${dbInfo.variables.length} variables`);
          }
        }

        return variables;

      } catch (plcError) {
        console.warn('PLC communication error, returning initial MongoDB data:', plcError);
        return variables;
      }
      
    } catch (error) {
      throw new AppError('Failed to fetch PLC variables', 500);
    }
  }

  /**
   * Group variables by DB number and calculate offset ranges
   * @param variables - Array of PLC variables
   * @returns Object with DB groups and their ranges
   */
  private groupVariablesByDB(variables: IPlcVariable[]) {
    const dbGroups: { [dbNumber: string]: { variables: IPlcVariable[], minOffset: number, maxOffset: number, totalSize: number } } = {};

    for (const variable of variables) {
      const dbNumber = variable.dbNumber.toString();
      
      if (!dbGroups[dbNumber]) {
        dbGroups[dbNumber] = {
          variables: [],
          minOffset: variable.offset,
          maxOffset: variable.offset,
          totalSize: 0
        };
      }

      dbGroups[dbNumber].variables.push(variable);
      
      // Update offset range
      dbGroups[dbNumber].minOffset = Math.min(dbGroups[dbNumber].minOffset, variable.offset);
      
      // Calculate variable size based on data type
      const variableSize = this.getVariableSize(variable.dataType);
      const variableEndOffset = variable.offset + variableSize;
      dbGroups[dbNumber].maxOffset = Math.max(dbGroups[dbNumber].maxOffset, variableEndOffset);
    }

    // Calculate total size for each DB group
    for (const dbNumber in dbGroups) {
      dbGroups[dbNumber].totalSize = dbGroups[dbNumber].maxOffset - dbGroups[dbNumber].minOffset;
    }

    return dbGroups;
  }

  /**
   * Get variable size in bytes based on data type
   * @param dataType - Variable data type
   * @returns Size in bytes
   */
  private getVariableSize(dataType: string): number {
    switch (dataType.toLowerCase()) {
      case 'bool':
        return 1;
      case 'integer':
        return 2;
      case 'real':
        return 4;
      default:
        return 1;
    }
  }

  /**
   * Read a range of data from a specific DB
   * @param dbNumber - DB number to read from
   * @param dbInfo - DB information including offset range
   * @returns Promise with buffer and start offset or null if failed
   */
  private async readDBRange(dbNumber: number, dbInfo: { minOffset: number, totalSize: number }): Promise<{ buffer: Buffer, startOffset: number } | null> {
    return new Promise((resolve) => {
      // Set 500ms timeout
      const timeout = setTimeout(() => {
        resolve(null);
      }, 500);

      try {
        // Read the entire range from PLC DB
        const readResult = this.client.DBRead(
          dbNumber,
          dbInfo.minOffset,
          dbInfo.totalSize
        );

        if (!readResult) {
          clearTimeout(timeout);
          resolve(null);
          return;
        }

        clearTimeout(timeout);
        resolve({
          buffer: readResult,
          startOffset: dbInfo.minOffset
        });

      } catch (error) {
        clearTimeout(timeout);
        resolve(null);
      }
    });
  }

  /**
   * Decode individual variable value from buffer
   * @param buffer - Buffer containing the data
   * @param variable - Variable to decode
   * @param bufferStartOffset - Starting offset of the buffer
   * @returns Decoded value or null if failed
   */
  private decodeVariableFromBuffer(buffer: Buffer, variable: IPlcVariable, bufferStartOffset: number): any {
    try {
      // Calculate relative position in buffer
      const relativeOffset = variable.offset - bufferStartOffset;
      
      // Ensure we don't read beyond buffer bounds
      const variableSize = this.getVariableSize(variable.dataType);
      if (relativeOffset + variableSize > buffer.length) {
        console.warn(`Buffer overflow for variable ${variable.name}`);
        return null;
      }

      // Parse buffer based on data type
      switch (variable.dataType.toLowerCase()) {
        case 'bool':
          return buffer.readUInt8(relativeOffset) !== 0;
        case 'integer':
          return buffer.readInt16BE(relativeOffset);
        case 'real':
          return buffer.readFloatBE(relativeOffset);
        default:
          return null;
      }
    } catch (error) {
      console.warn(`Failed to decode variable ${variable.name}:`, error);
      return null;
    }
  }

  /**
   * Update a PLC variable by writing to the PLC using snap7 or just MongoDB
   * @param name - Name of the variable to update
   * @param value - New value to write
   * @param type - Optional type override
   * @returns Promise<IPlcVariable> - Updated variable
   */
  async updateVariable(name: string, value: any, type: string | null = null): Promise<IPlcVariable> {
    try {
      // Find the variable in the database
      const variable = await PlcVariable.findOne({ name });
      if (!variable) {
        throw new AppError(`PLC variable '${name}' not found`, 404);
      }

      // Use provided type or fall back to variable's type
      const dataType = type || variable.dataType;
      
      // Check if we have a PLC client and can connect
      const canConnectToPLC = this.client && (this.isConnected() || await this.connectWithTimeout());
      
      if (canConnectToPLC) {
        // PLC is available - write to PLC and then update database
        console.log(`Writing ${value} to PLC variable '${name}' (DB${variable.dbNumber}, offset:${variable.offset})`);
        
        try {
          // Prepare data buffer based on data type
          let buffer: Buffer;
          let dataSize: number;

          switch (dataType.toLowerCase()) {
            case 'bool':
              buffer = Buffer.alloc(1);
              buffer.writeUInt8(value ? 1 : 0, 0);
              dataSize = 1;
              break;
              
            case 'integer':
              buffer = Buffer.alloc(2);
              buffer.writeInt16BE(parseInt(value), 0);
              dataSize = 2;
              break;
              
            case 'real':
              buffer = Buffer.alloc(4);
              buffer.writeFloatBE(parseFloat(value), 0);
              dataSize = 4;
              break;
              
            default:
              throw new AppError(`Unsupported data type: ${dataType}`, 400);
          }

          // Write to PLC DB
          const writeResult = this.client.DBWrite(
            variable.dbNumber,
            variable.offset,
            dataSize,
            buffer
          );

          if (!writeResult) {
            const errorCode = this.client.LastError();
            console.warn(`PLC write failed for ${name}: ${this.client.ErrorText(errorCode)}, updating MongoDB only`);
            // Fall through to MongoDB update
          } else {
            console.log(`Successfully wrote ${value} to PLC variable '${name}'`);
          }
        } catch (plcError) {
          console.warn(`PLC write error for ${name}:`, plcError, ', updating MongoDB only');
          // Fall through to MongoDB update
        }
      } else {
        // No PLC connection - just update database
        console.log(`[NO PLC] Updating ${name} = ${value} in MongoDB only`);
      }

      // Always update the variable in the database
      variable.value = value;
      if (type) {
        variable.type = type;
      }
      await variable.save();

      return variable;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update PLC variable', 500);
    }
  }

  /**
   * Read a variable value from PLC
   * @param name - Name of the variable to read
   * @returns Promise<any> - Current value from PLC
   */
  async readVariable(name: string): Promise<any> {
    try {
      const variable = await PlcVariable.findOne({ name });
      if (!variable) {
        throw new AppError(`PLC variable '${name}' not found`, 404);
      }

      // Connect to PLC if not already connected
      if (!this.isConnected()) {
        if (!this.client) {
          console.log(`[SIMULATION] Would read from PLC variable '${name}', returning stored value: ${variable.value}`);
          return variable.value || variable.startValue || 0;
        }
        
        const connectionResult = await this.connectWithTimeout();
        if (!connectionResult) {
          throw new AppError('Failed to connect to PLC', 500);
        }
      }

      // Determine data size based on type
      let dataSize: number;
      switch (variable.dataType.toLowerCase()) {
        case 'bool':
          dataSize = 1;
          break;
        case 'integer':
          dataSize = 2;
          break;
        case 'real':
          dataSize = 4;
          break;
        default:
          throw new AppError(`Unsupported data type: ${variable.dataType}`, 400);
      }

      // Read from PLC DB
      const readResult = this.client.DBRead(
        variable.dbNumber,
        variable.offset,
        dataSize
      );

      if (!readResult) {
        const errorCode = this.client.LastError();
        throw new AppError(`Failed to read from PLC: ${this.client.ErrorText(errorCode)}`, 500);
      }

      const buffer = readResult;

      // Parse buffer based on data type
      let value: any;
      switch (variable.dataType.toLowerCase()) {
        case 'bool':
          value = buffer.readUInt8(0) !== 0;
          break;
        case 'integer':
          value = buffer.readInt16BE(0);
          break;
        case 'real':
          value = buffer.readFloatBE(0);
          break;
      }

      // Update database with current value
      variable.value = value;
      await variable.save();

      return value;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to read PLC variable', 500);
    }
  }

  /**
   * Get a single variable by name
   * @param name - Name of the variable
   * @returns Promise<IPlcVariable> - The variable
   */
  async getVariableByName(name: string): Promise<IPlcVariable> {
    try {
      const variable = await PlcVariable.findOne({ name });
      if (!variable) {
        throw new AppError(`PLC variable '${name}' not found`, 404);
      }
      return variable;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch PLC variable', 500);
    }
  }

  /**
   * Disconnect from PLC
   */
  async disconnect(): Promise<void> {
    if (this.client && this.client.Connected && this.client.Connected()) {
      this.client.Disconnect();
    }
  }

  /**
   * Connect to PLC with timeout to prevent system hanging
   * @returns Promise<boolean> - Connection success
   */
  private async connectWithTimeout(): Promise<boolean> {
    if (!this.client) return false;

    // Nếu đã kết nối thì khỏi làm nữa
    try { if (this.client.Connected && this.client.Connected()) return true; } catch {}

    const host = PLC_CONFIG.HOST;
    const rack = PLC_CONFIG.RACK;   
    const slot = PLC_CONFIG.SLOT;  
    const ms = 500;
    return new Promise<boolean>((resolve) => {
        let settled = false;

        const onSettle = (ok: boolean) => {
        if (settled) return;
        settled = true;
        try { this.client.Disconnect(); } catch {}
        resolve(ok);
        };

        // Timer timeout 500ms
        const timer = setTimeout(() => {
            console.warn(`PLC connect timeout (${ms}ms)`);
            onSettle(false); // sẽ Disconnect() ở đây
        }, ms);

        this.client.ConnectTo(host, rack, slot, (err: number) => {
        if (settled) return;         
        clearTimeout(timer);
        if (err) {
            console.warn('Connect failed:', this.client.ErrorText?.(err) ?? err);
            onSettle(false);
        } else {
            settled = true;
            resolve(true);            
        }
        });
    });
  }

  /**
   * Get connection status
   * @returns boolean - Connection status
   */
  isConnected(): boolean {
    return this.client && this.client.Connected && this.client.Connected();
  }
}
