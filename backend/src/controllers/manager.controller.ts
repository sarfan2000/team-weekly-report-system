import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as reportService from '../services/report.service';
import * as analyticsService from '../services/analytics.service';

export const getTeamReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await reportService.getTeamReports(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const report = await reportService.reviewReport(
      req.params.id,
      req.user.id,
      req.body
    );
    
    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await analyticsService.getAnalyticsSummary();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsCharts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const charts = await analyticsService.getAnalyticsCharts();
    res.status(200).json({
      success: true,
      data: charts,
    });
  } catch (error) {
    next(error);
  }
};
