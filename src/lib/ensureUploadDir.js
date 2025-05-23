import { mkdir } from 'fs/promises';
import { join } from 'path';

export async function ensureUploadDir(folder = 'properties') {
  try {
    const uploadDir = join(process.cwd(), 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating upload directory:', error);
      throw error;
    }
  }
} 