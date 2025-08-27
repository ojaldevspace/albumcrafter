// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import s3 from '@/app/lib/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('file') as File[];
  const createdAt = new Date().toISOString();

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
  }

  const uploadedFileUrls: string[] = [];

  const bucketName = process.env.AWS_S3_BUCKET;

    if (!bucketName) {
        console.error("Missing S3_BUCKET env variable");
        return NextResponse.json({ error: "S3 bucket is not configured" }, { status: 500 });
    }

    const jobNumber = formData.get('jobNumber')?.toString() || 'unknown';
    const uploadDate = createdAt.toString().split('T')[0];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileKey = `${uploadDate}/${jobNumber}/images/${file.name}`;
    
        const uploadParams = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
          CacheControl: "public, max-age=43200 s-maxage=604800"
        });
    
        await s3.send(uploadParams);
    
        const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        uploadedFileUrls.push(fileUrl);
      }

  return NextResponse.json({ files: uploadedFileUrls, createdAt: createdAt });
}
