import { PlcVariable, IPlcVariable } from '@/models/plc-variable.model';
import { AppError } from '@/middlewares/error.middleware';
import { PLC_CONFIG } from '@/config';
import net from 'net';

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

  private tcpProbe102(host: string, timeoutMs = 500): Promise<boolean> {
    const net = require('net');
    return new Promise((resolve) => {
      const s = new net.Socket();
      const done = (ok: boolean) => { try { s.destroy(); } catch {} ; resolve(ok); };
      s.setTimeout(timeoutMs);
      s.once('connect', () => done(true));
      s.once('timeout', () => done(false));
      s.once('error', () => done(false));
      s.connect(102, host);
    });
  }

  constructor() {
    if (snap7) {
      this.client = new snap7.S7Client();
    } else {
      this.client = null;
    }
  }

  private normalizePlcParams() {
    const host = String(PLC_CONFIG.HOST ?? '').trim();
    const rack = Number(PLC_CONFIG.RACK);
    const slot = Number(PLC_CONFIG.SLOT);
  
    const rackOK = Number.isFinite(rack) && Number.isInteger(rack) && rack >= 0;
    const slotOK = Number.isFinite(slot) && Number.isInteger(slot) && slot >= 0;
    const hostOK = !!host;
  
    return { host, rack, slot, hostOK, rackOK, slotOK };
  }

  

  /**
   * Read all PLC variables from the database and get current values from PLC
   * @param queries - Query parameters including type filter
   * @returns Promise<IPlcVariable[]> - Array of all PLC variables with current values from PLC
   */
  async readVariablesFromPLC(queries: any, listVariables?: any | null): Promise<IPlcVariable[]> {
    try {
      const { type } = queries;
      
      // First, fetch all variables from MongoDB
      const variables = listVariables ? listVariables : (await PlcVariable.find({ type }).sort({ name: 1 }).lean());
      
      // If no snap7 client available, return variables with stored values
      if (!this.client) {
        console.log('[SIMULATION] Returning MongoDB data without PLC read');
        return variables;
      }
      
      try {
        // Connect to PLC if not already connected
        if (!this.isConnected()) {
          const connectionResult = await this.connectWithTimeout();
          if (!connectionResult) {
            console.warn('Failed to connect to PLC, returning stored values');
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
                }
              } catch (decodeError) {
                console.warn(`Failed to decode variable ${variable.name}:`, decodeError);
              }
            }
          } else {
            // Keep original values if DB read failed
            console.warn(`Failed to read DB ${dbNumber}, keeping stored values for ${dbInfo.variables.length} variables`);
          }
        }

        return variables;

      } catch (plcError) {
        console.warn('PLC communication error, returning stored values:', plcError);
        return variables;
      }
      
    } catch (error) {
      throw new AppError('Failed to read PLC variables', 500);
    }
  }

  /**
   * Write a value to a PLC variable
   * @param name - Name of the variable to write to
   * @param value - Value to write
   * @returns Promise<boolean> - Success status
   */
  async writeVariableToPLC(name: string, value: any): Promise<boolean> {
    try {
      // Find the variable in the database to get its configuration
      const variable = await PlcVariable.findOne({ name });
      if (!variable) {
        throw new AppError(`PLC variable '${name}' not found`, 404);
      }

      // Check if we have a PLC client and can connect
      if (!this.client) {
        console.log(`[SIMULATION] Would write ${value} to PLC variable '${name}'`);
        return true;
      }

      const canConnectToPLC = this.isConnected() || await this.connectWithTimeout();
      
      if (!canConnectToPLC) {
        throw new AppError('Failed to connect to PLC', 500);
      }

      console.log(`Writing ${value} to PLC variable '${name}' (DB${variable.dbNumber}, offset:${variable.offset})`);
      
      // Prepare data buffer based on data type
      let buffer: Buffer;
      let dataSize: number;

      switch (variable.dataType.toLowerCase()) {
        case 'bool': {
          const { byte, bit } = this.parseBitAddress(variable.offset);
        
          // Đọc 1 byte tại byte offset trước, để không ảnh hưởng các bit lân cận
          const read1 = this.client.DBRead(variable.dbNumber, byte, 1);
          if (!read1) {
            const e = this.client.LastError?.();
            throw new AppError(`PLC read-before-write failed: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
        
          const cur = (read1 as Buffer).readUInt8(0);
          // Nếu offset là số nguyên (bit === null), mặc định điều khiển bit 0
          const next = this.setBitInByte(cur, (bit ?? 0), !!value);
          const buf = Buffer.from([next]);
        
          const ok = this.client.DBWrite(variable.dbNumber, byte, 1, buf);
          if (!ok) {
            const e = this.client.LastError?.();
            throw new AppError(`PLC write failed: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
          return true;
        }
          
        case 'int':
        case 'integer':
          buffer = Buffer.alloc(2);
          buffer.writeInt16BE(parseInt(value), 0);
          dataSize = 2;
          break;
          
        case 'dint':
          buffer = Buffer.alloc(4);
          buffer.writeInt32BE(parseInt(value), 0);
          dataSize = 4;
          break;
          
        case 'real':
          buffer = Buffer.alloc(4);
          buffer.writeFloatBE(parseFloat(value), 0);
          dataSize = 4;
          break;
          
        case 'lreal':
          buffer = Buffer.alloc(8);
          buffer.writeDoubleBE(parseFloat(value), 0);
          dataSize = 8;
          break;
          
        default:
          throw new AppError(`Unsupported data type: ${variable.dataType}`, 400);
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
        throw new AppError(`PLC write failed: ${this.client.ErrorText(errorCode)}`, 500);
      }

      console.log(`Successfully wrote ${value} to PLC variable '${name}'`);
      return true;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to write to PLC variable with error: ' + error, 500);
    }
  }

  /**
   * Read a single variable value from PLC
   * @param name - Name of the variable to read
   * @returns Promise<any> - Current value from PLC
   */
  async readVariableFromPLC(name: string, ignoreThrowError: boolean = false): Promise<any> {
    try {
      const variable = await PlcVariable.findOne({ name });
      if (!variable) {
        if(ignoreThrowError){
          console.log(`PLC variable '${name}' not found in database, return 0`)
          return 0;
        }else{
          throw new AppError(`PLC variable '${name}' not found in database`, 404);
        }
        
      }
  
      if (!this.client) {
        console.log(`[SIMULATION] Would read from PLC variable '${name}', returning stored value: ${variable.value}`);
        return variable.value || variable.startValue || 0;
      }
  
      if (!this.isConnected()) {
        const connectionResult = await this.connectWithTimeout();
        if (!connectionResult) {
          throw new AppError('Failed to connect to PLC', 500);
        }
      }
  
      // BOOL xử lý riêng theo byte/bit, các type khác vẫn giữ nguyên
      switch (variable.dataType.toLowerCase()) {
        case 'bool': {
          const { byte, bit } = this.parseBitAddress(variable.offset);
          const read1 = this.client.DBRead(variable.dbNumber, byte, 1);
          if (!read1) {
            const e = this.client.LastError?.();
            throw new AppError(`Failed to read ${name} from PLC: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
          const cur = (read1 as Buffer).readUInt8(0);
          return this.getBitFromByte(cur, (bit ?? 0));
        }
        case 'int':
        case 'integer': {
          const read2 = this.client.DBRead(variable.dbNumber, variable.offset, 2);
          if (!read2) {
            const e = this.client.LastError?.();
            throw new AppError(`Failed to read ${name} from PLC: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
          return (read2 as Buffer).readInt16BE(0);
        }
        
        case 'dint': {
          const read4 = this.client.DBRead(variable.dbNumber, variable.offset, 4);
          if (!read4) {
            const e = this.client.LastError?.();
            throw new AppError(`Failed to read ${name} from PLC: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
          return (read4 as Buffer).readInt32BE(0);
        }
  
        case 'real': {
          const read4 = this.client.DBRead(variable.dbNumber, variable.offset, 4);
          if (!read4) {
            const e = this.client.LastError?.();
            throw new AppError(`Failed to read ${name} from PLC: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
          return (read4 as Buffer).readFloatBE(0);
        }
        
        case 'lreal': {
          const read8 = this.client.DBRead(variable.dbNumber, variable.offset, 8);
          if (!read8) {
            const e = this.client.LastError?.();
            throw new AppError(`Failed to read ${name} from PLC: ${this.client.ErrorText?.(e) ?? e}`, 500);
          }
          return (read8 as Buffer).readDoubleBE(0);
        }
  
        default:
          throw new AppError(`Unsupported data type: ${variable.dataType}`, 400);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to read PLC variable ${name}`, 500);
    }
  }

  /**
   * Write multiple variables to PLC
   * @param variables - Array of variables to write
   * @returns Promise<boolean[]> - Success status for each variable
   */
  async writeMultipleVariablesToPLC(variables: Array<{ name: string; value: any }>): Promise<boolean[]> {
    try {
      const results: boolean[] = [];
      
      for (const variableData of variables) {
        try {
          const result = await this.writeVariableToPLC(variableData.name, variableData.value);
          results.push(result);
        } catch (error) {
          console.warn(`Failed to write variable ${variableData.name}:`, error);
          results.push(false);
        }
      }

      return results;
    } catch (error) {
      throw new AppError('Failed to write multiple variables to PLC', 500);
    }
  }

  /**
   * Get PLC connection status
   * @returns boolean - Connection status
   */
  isConnected(): boolean {
    return this.client && this.client.Connected && this.client.Connected();
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
      case 'int':
      case 'integer':
        return 2;
      case 'dint':
        return 4;
      case 'real':
        return 4;
      case 'lreal':
        return 8;
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
        case 'bool': {
          const { byte, bit } = this.parseBitAddress(variable.offset);
          const byteIndex = byte - bufferStartOffset;
          if (byteIndex < 0 || byteIndex >= buffer.length) {
            console.warn(`Buffer overflow for variable ${variable.name}`);
            return null;
          }
          const cur = buffer.readUInt8(byteIndex);
          return this.getBitFromByte(cur, (bit ?? 0));
        }
        case 'int':
        case 'integer':
          return buffer.readInt16BE(relativeOffset);
        case 'dint':
          return buffer.readInt32BE(relativeOffset);
        case 'real':
          return buffer.readFloatBE(relativeOffset);
        case 'lreal':
          return buffer.readDoubleBE(relativeOffset);
        default:
          return null;
      }
    } catch (error) {
      console.warn(`Failed to decode variable ${variable.name}:`, error);
      return null;
    }
  }

  /**
   * Connect to PLC with timeout to prevent system hanging
   * @returns Promise<boolean> - Connection success
   */
  private async connectWithTimeout(): Promise<boolean> {
    if (!this.client) return false;
    try { if (this.client.Connected && this.client.Connected()) return true; } catch {}
  
    const { host, rack, slot, hostOK, rackOK, slotOK } = this.normalizePlcParams();
  
    // Log chẩn đoán – giúp bắt lỗi cấu hình nhầm
    if (!hostOK || !rackOK || !slotOK) {
      console.warn('[PLC] Bad params:',
        { host, rack, slot, hostOK, rackOK, slotOK, TYPE_host: typeof host, TYPE_rack: typeof rack, TYPE_slot: typeof slot }
      );
    }
  
    // 1) Gate: probe TCP/102 để tránh gọi ConnectTo khi đích chết (timeout tự mình kiểm soát)
    const ms = 2000;
    const portOk = await this.tcpProbe102(host, ms);
    if (!portOk) {
      console.warn(`TCP 102 to ${host} not reachable within ${ms}ms`);
      return false;
    }
  
    try {
      if (!hostOK || !rackOK || !slotOK) {
        console.warn('[PLC] Bad params:', { host, rack, slot });
        // Nếu muốn bỏ qua ConnectTo khi rack/slot invalid:
        // return false; // hoặc chỉ thử TSAP bên dưới
      }
      // 2) Nhánh 1: Dùng ConnectTo nếu tham số hợp lệ (dành cho S7-300/400, hoặc 1200/1500 vẫn OK)
      if (hostOK && rackOK && slotOK) {
        // ⚠️ Windows: bắt buộc 3 tham số, tất cả là số nguyên
        console.log('[ConnectTo] host=%s rack=%d slot=%d types=', host, rack, slot, typeof host, typeof rack, typeof slot);
        const ret = this.client.ConnectTo(host, rack, slot);
        const ok = (ret === true) || (ret === 0);
        if (ok) return true;
  
        const code = this.client.LastError?.() ?? -1;
        const text = this.client.ErrorText?.(code) ?? `code=${code}`;
        console.warn(`ConnectTo failed: ${text}`);
        try { this.client.Disconnect?.(); } catch {}
        // rơi xuống thử TSAP
      } else {
        console.warn('Skip ConnectTo because rack/slot are invalid; trying TSAP…');
      }
  
      // 3) Nhánh 2: Fallback TSAP (ổn cho S7-1200/1500, yêu cầu bật PUT/GET)
      try {
        this.client.SetConnectionParams(host, 0x0100, 0x0100); // PG/PG
        const ret2 = this.client.Connect();
        const ok2 = (ret2 === true) || (ret2 === 0);
        if (ok2) return true;
  
        const code2 = this.client.LastError?.() ?? -1;
        const text2 = this.client.ErrorText?.(code2) ?? `code=${code2}`;
        console.warn(`TSAP Connect failed: ${text2}`);
        try { this.client.Disconnect?.(); } catch {}
        return false;
      } catch (e2) {
        console.warn('TSAP Connect threw:', e2);
        try { this.client.Disconnect?.(); } catch {}
        return false;
      }
    } catch (e) {
      // Nếu bạn vẫn thấy “Wrong arguments” ở đây, 100% tham số vào ConnectTo không đúng kiểu/số lượng
      console.warn('ConnectTo threw error:', e);
      try { this.client.Disconnect?.(); } catch {}
      return false;
    }
  }

  /** Parse số offset kiểu 0.1 → { byte:0, bit:1 }. Nếu là số nguyên → { byte:offset, bit:null } */
  private parseBitAddress(rawOffset: number | string): { byte: number; bit: number | null } {
    const n = typeof rawOffset === 'string' ? Number(rawOffset) : rawOffset;
    if (!Number.isFinite(n)) throw new AppError(`Invalid offset: ${rawOffset}`, 400);
    const byte = Math.floor(n);
    const frac = n - byte;
    if (Math.abs(frac) < 1e-9) return { byte, bit: null }; // nguyên byte
    // quy ước 0.1..0.7 → bit 1..7
    const bit = Math.round(frac * 10);
    if (bit < 0 || bit > 7) throw new AppError(`Invalid bit index from offset ${rawOffset}`, 400);
    return { byte, bit };
  }

  /** Set/Clear 1 bit trong 1 byte buffer */
  private setBitInByte(byteVal: number, bitIndex: number, value: boolean): number {
    if (value) return (byteVal | (1 << bitIndex)) & 0xFF;
    return (byteVal & ~(1 << bitIndex)) & 0xFF;
  }

  /** Get 1 bit từ 1 byte */
  private getBitFromByte(byteVal: number, bitIndex: number): boolean {
    return ((byteVal >> bitIndex) & 1) === 1;
  }
  /**
   * Convert array of PLC variables to object format
   * @param variables - Array of PLC variables from readVariablesFromPLC
   * @returns Object with variable names as keys and values as values
   */
  toVariablesObject(variables: IPlcVariable[]): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    
    for (const variable of variables) {
      result[variable.name] = variable.value;
    }
    
    return result;
  }

  /**
   * Check PLC connectivity at app startup
   * @returns Promise<boolean> - true if connected, false otherwise
   */
  async checkConnected(): Promise<boolean> {
    if (!this.client) {
      console.warn('[SIMULATION] PLC client not initialized');
      return false;
    }
    if (this.isConnected()) return true;
    const ok = await this.connectWithTimeout();
    if (ok) {
      console.log(`PLC OK (${PLC_CONFIG.HOST}, Rack ${PLC_CONFIG.RACK}, Slot ${PLC_CONFIG.SLOT})`);
      return true;
    }
    console.warn('PLC not reachable at startup');
    return false;
  }
}
