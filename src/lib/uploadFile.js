import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file, folder = 'properties') {
  try {
    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create the full path
    const uploadDir = join(process.cwd(), 'uploads', folder);
    const filePath = join(uploadDir, fileName);
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file
    await writeFile(filePath, buffer);
    
    // Return the relative path that can be used in URLs
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
} 