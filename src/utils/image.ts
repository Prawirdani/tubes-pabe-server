import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export function deleteImage(imageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const imagePath = path.join('uploads', imageName);

    fs.unlink(imagePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // If file not found, then resolve
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

export async function storeImage(filename: string, buf: Buffer) {
  const filepath = path.join('uploads/', filename);
  await writeFile(filepath, buf);
}
