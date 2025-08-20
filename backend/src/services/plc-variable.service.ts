import { PlcVariable, IPlcVariable } from '@/models/plc-variable.model';
import { AppError } from '@/middlewares/error.middleware';

export class PlcVariableService {
  /**
   * Get all PLC variables from the database
   * @param queries - Query parameters including type filter
   * @returns Promise<IPlcVariable[]> - Array of all PLC variables
   */
  async getVariables(queries: any): Promise<IPlcVariable[]> {
    try {
      const { type } = queries;
      // Fetch all PLC variables from MongoDB
      const variables = await PlcVariable.find({ type }).sort({ name: 1 });
      return variables;
    } catch (error) {
      throw new AppError('Failed to fetch PLC variables', 500);
    }
  }

  /**
   * Update a PLC variable in the database
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

      // Update the variable in the database
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
      throw new AppError('Failed to update variable', 500);
    }
  }

  /**
   * Update multiple PLC variables in the database
   * @param variables - Array of variables to update
   * @param type - Type to set for all variables
   * @returns Promise<IPlcVariable[]> - Updated variables
   */
  async updateMultipleVariables(variables: Array<{ name: string; value: any }>, type?: string): Promise<IPlcVariable[]> {
    try {
      const updatedVariables: IPlcVariable[] = [];
      
      for (const variableData of variables) {
        const variable = await this.updateVariable(variableData.name, variableData.value, type);
        updatedVariables.push(variable);
      }

      return updatedVariables;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update multiple PLC variables', 500);
    }
  }

  /**
   * Get a single PLC variable by name
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
   * Create a new PLC variable
   * @param variableData - Variable data to create
   * @returns Promise<IPlcVariable> - Created variable
   */
  async createVariable(variableData: Partial<IPlcVariable>): Promise<IPlcVariable> {
    try {
      const variable = new PlcVariable(variableData);
      await variable.save();
      return variable;
    } catch (error) {
      throw new AppError('Failed to create PLC variable', 500);
    }
  }

  /**
   * Delete a PLC variable
   * @param name - Name of the variable to delete
   * @returns Promise<boolean> - Success status
   */
  async deleteVariable(name: string): Promise<boolean> {
    try {
      const result = await PlcVariable.deleteOne({ name });
      if (result.deletedCount === 0) {
        throw new AppError(`PLC variable '${name}' not found`, 404);
      }
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete PLC variable', 500);
    }
  }
}
