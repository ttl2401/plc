import { User, IUser } from '@/models/user.model';
import { AppError } from '@/middleware/error.middleware';
import { PaginateResult } from '@/controllers/base.controller';

interface MongoError extends Error {
  code?: number;
}

export class UserService {
  // Create a new user
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.create(userData);
      // Don't return password in response
      return user;
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        throw new AppError('Email already exists', 400);
      }
      throw error;
    }
  }

  // Get all users
  async getUsers(query: any): Promise<PaginateResult<IUser>> {
    const { page = 1, limit = 10, search } = query;
    const queryFilter: any = {};
    
    if (search) {
      // Create a case-insensitive regex for the search term
      const searchRegex = new RegExp(search, 'i');
      // Use $or to search in both name and email fields
      queryFilter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      select: '-password'
    };
    return await User.paginate(queryFilter, options) as PaginateResult<IUser>;
  }

  // Get a single user by ID
  async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id).select('-password');
    if (!user) {
      throw new AppError('No user found with that ID', 404);
    }
    return user;
  }

  // Update a user
  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    // If password is being updated, it will be hashed by the pre-save middleware
    const user = await User.findByIdAndUpdate(
      id,
      userData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      throw new AppError('No user found with that ID', 404);
    }

    return user;
  }

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('No user found with that ID', 404);
    }
  }

  // Verify user password
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('No user found with that ID', 404);
    }
    return user.comparePassword(password);
  }
} 