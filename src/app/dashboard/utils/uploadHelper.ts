
import { AlbumFormData } from '@/types/AlbumFormData';

function getISTDateTimeString(): string {
    const now = new Date();
  
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60; // in minutes
    const localOffset = now.getTimezoneOffset(); // in minutes
    const istTime = new Date(now.getTime() + (istOffset + localOffset) * 60 * 1000);
  
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    const year = istTime.getFullYear();
    const month = pad(istTime.getMonth() + 1);
    const date = pad(istTime.getDate());
    const hours = pad(istTime.getHours());
    const minutes = pad(istTime.getMinutes());
    const seconds = pad(istTime.getSeconds());
  
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  }  

export async function uploadAlbum(formData: AlbumFormData, selectedFiles: File[]): Promise<{
  success: boolean;
  imageUrls?: string[];
  error?: string;
}> {
  if (selectedFiles.length === 0) {
    return { success: false, error: 'Please select files to upload' };
  }

  try {
    const uploadForm = new FormData();

    for (const file of selectedFiles) {
      uploadForm.append('file', file, file.name);
    }

    const createdAt = getISTDateTimeString().split(' ')[0];
    uploadForm.append('jobNumber', formData.jobNumber);
    uploadForm.append('uploadDate', createdAt);

    // Upload images to S3

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: uploadForm,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return { success: false, error: uploadResult.error || 'Image upload failed' };
    }

    const imageUrls = uploadResult.files;

    // Save metadata + image URLs to DynamoDB
    const metadataResponse = await fetch('/api/createAlbum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        imageUrls,
        createdAt,
      }),
    });

    const metadataResult = await metadataResponse.json();

    if (!metadataResponse.ok) {
      return { success: false, error: metadataResult.error || 'Failed to save album data' };
    }

    return {
      success: true,
      imageUrls,
    };
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, error: 'Something went wrong during upload' };
  }
}
