import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as aiService from '../services/ai.service';

export const chat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query } = req.body;
    const response = await aiService.processQuery(query);
    
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
