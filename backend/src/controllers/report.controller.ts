import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as reportService from '../services/report.service';

export const getMyReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const result = await reportService.getMyReports(req.user.id, req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const report = await reportService.getReportById(req.params.id);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const report = await reportService.createReport(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const report = await reportService.updateReport(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const submitReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const report = await reportService.submitReport(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportVersions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const versions = await reportService.getReportVersions(req.params.id);
    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportVersion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, versionNum } = req.params;
    const version = await reportService.getReportVersion(
      id,
      parseInt(versionNum)
    );
    res.status(200).json({
      success: true,
      data: version,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await reportService.deleteReport(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
