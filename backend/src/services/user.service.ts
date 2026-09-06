import { User } from '../models/User';
import { UserRole } from '../types';
import { AppError } from '../utils/errors';

export const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    department: user.department,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }));
};

export const updateUser = async (userId: string, updates: Partial<{ role: UserRole, name: string, email: string, phoneNumber: string, department: string }>) => {
  if (updates.role && !Object.values(UserRole).includes(updates.role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatarUrl: user.avatarUrl,
  };
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return true;
};
