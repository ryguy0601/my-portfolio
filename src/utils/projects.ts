// src/utils/projects.ts
import { splitCommaList } from './text';

export interface Project {
  id: number;
  title: string;
  slug?: string;
  summary: string;
  content?: string | null;
  tech_stack: string;
  live_url?: string | null;
  github_url?: string | null;
  featured?: boolean;
  image_url?: string | null;
  image_filenames?: string[] | null;
  project_experience?: Array<{
    work_experience?: any;
  }>;
}

/**
 * Universal project image parser that handles arrays, JSON-encoded strings,
 * comma-delimited strings, and fallback single image URLs.
 */
export function parseProjectImages(project: any): string[] {
  if (!project) return [];

  if (Array.isArray(project.image_filenames) && project.image_filenames.length > 0) {
    return project.image_filenames;
  }

  if (typeof project.image_filenames === 'string' && project.image_filenames.trim().length > 0) {
    try {
      const parsed = JSON.parse(project.image_filenames);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      const split = splitCommaList(project.image_filenames);
      if (split.length > 0) return split;
    }
  }

  if (project.image_url) {
    if (typeof project.image_url === 'string' && project.image_url.includes(',')) {
      return splitCommaList(project.image_url);
    }
    return [project.image_url];
  }

  return [];
}

/**
 * Joins a folder path with filename items ensuring clean forward slashes.
 */
export function formatImagePaths(folder: string, filenames: string[]): string[] {
  const cleanFilenames = filenames.map((f) => f.trim()).filter(Boolean);
  if (!folder) return cleanFilenames;

  const cleanFolder = folder.endsWith('/') ? folder : `${folder}/`;
  return cleanFilenames.map((file) => `${cleanFolder}${file}`);
}

/**
 * Deconstructs existing image file paths into a common folder prefix and filenames list.
 */
export function extractFolderAndFilenames(imagePaths: string[] | null | undefined): { folder: string; filenames: string[] } {
  if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
    return { folder: '', filenames: [''] };
  }

  const firstFile = imagePaths[0] || '';
  const lastSlashIndex = firstFile.lastIndexOf('/');

  if (lastSlashIndex !== -1) {
    const folder = firstFile.substring(0, lastSlashIndex);
    const filenames = imagePaths.map((p: string) => p.substring(lastSlashIndex + 1));
    return { folder, filenames: filenames.length > 0 ? filenames : [''] };
  }

  return { folder: '', filenames: imagePaths.length > 0 ? [...imagePaths] : [''] };
}
