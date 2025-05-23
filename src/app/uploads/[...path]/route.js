import { join } from 'path';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const filePath = join(process.cwd(), 'uploads', ...params.path);
    const file = await readFile(filePath);
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop().toLowerCase();
    const contentType = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
    }[extension] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
} 