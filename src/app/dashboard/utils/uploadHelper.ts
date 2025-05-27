
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
    const uploadedImageUrls: string[] = [];
    let createdAt = new Date().toISOString();
    const chunkSize = 5;

    for (let i = 0; i < selectedFiles.length; i += chunkSize) {
      const chunk = selectedFiles.slice(i, i + chunkSize);
      const uploadForm = new FormData();

      for (const file of chunk) {
        uploadForm.append('file', file, file.name);
      }

      uploadForm.append('jobNumber', formData.jobNumber);
      uploadForm.append('uploadDate', createdAt);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        return { success: false, error: uploadResult.error || 'Image upload failed' };
      }

      uploadedImageUrls.push(...uploadResult.files);
      createdAt = uploadResult.createdAt;
    }


    // Save metadata + image URLs to DynamoDB
    const metadataResponse = await fetch('/api/createAlbum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        imageUrls: uploadedImageUrls,
        createdAt,
      }),
    });

    const metadataResult = await metadataResponse.json();

    if (!metadataResponse.ok) {
      return { success: false, error: metadataResult.error || 'Failed to save album data' };
    }

    return {
      success: true,
      imageUrls: uploadedImageUrls,
    };
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, error: 'Something went wrong during upload' };
  }
}
