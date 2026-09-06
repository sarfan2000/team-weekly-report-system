import { Project } from '../models/Project';
import { CreateProjectDTO, UpdateProjectDTO } from '../types';
import { AppError } from '../utils/errors';

export const getAllProjects = async () => {
  const projects = await Project.find().sort({ createdAt: -1 });
  return projects;
};

export const getProjectById = async (projectId: string) => {
  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

export const createProject = async (dto: CreateProjectDTO) => {
  const project = await Project.create(dto);
  return project;
};

export const updateProject = async (
  projectId: string,
  dto: UpdateProjectDTO
) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    dto,
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

export const deleteProject = async (projectId: string) => {
  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};
