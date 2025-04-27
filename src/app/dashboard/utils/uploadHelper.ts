
import { AlbumFormData } from '@/types/AlbumFormData';

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

    const createdAt = new Date().toISOString();
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
