
import { AlbumFormData } from '@/types/AlbumFormData';

async function uploadToS3(file: File, jobNumber: string): Promise<string> {
  const presignRes = await fetch('/api/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileType: file.type, jobNumber }),
  });

  if (!presignRes.ok) throw new Error('Failed to get presigned URL');

  const { url, imageUrl } = await presignRes.json();

  const uploadRes = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) throw new Error('Upload failed');

  return imageUrl;
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
    const uploadedImageUrls: string[] = [];
    let createdAt = new Date().toISOString();

    for (const file of selectedFiles) {
      const imageUrl = await uploadToS3(file, formData.jobNumber);
      uploadedImageUrls.push(imageUrl);
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
