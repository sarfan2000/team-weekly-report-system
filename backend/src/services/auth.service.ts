import { User } from '../models/User';
import { RegisterDTO, LoginDTO } from '../types';
import { AppError } from '../utils/errors';
import { generateToken } from '../utils/jwt';

export const register = async (dto: RegisterDTO) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: dto.email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Generate password if not provided (mocking email delivery workflow)
  const generatedPassword = dto.password ? '' : Math.random().toString(36).slice(-8) + 'X1!';
  const finalPassword = dto.password || generatedPassword;

  // Create user
  const user = await User.create({
    name: dto.name,
    email: dto.email,
    password: finalPassword,
    role: dto.role,
    phoneNumber: dto.phoneNumber,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    generatedPassword: generatedPassword || undefined,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
    },
  };
};

export const login = async (dto: LoginDTO) => {
  // Find user with password field
  const user = await User.findOne({ email: dto.email }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(dto.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatarUrl: user.avatarUrl,
    },
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatarUrl: user.avatarUrl,
  };
};
