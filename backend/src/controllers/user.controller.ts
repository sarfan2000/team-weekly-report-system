import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow specific fields to prevent tampering
    const allowedUpdates = {
      name: updates.name,
      email: updates.email,
      role: updates.role,
      phoneNumber: updates.phoneNumber,
      department: updates.department,
    };
    // Clean out undefined
    Object.keys(allowedUpdates).forEach(key => (allowedUpdates as any)[key] === undefined && delete (allowedUpdates as any)[key]);

    const user = await userService.updateUser(id, allowedUpdates);
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
