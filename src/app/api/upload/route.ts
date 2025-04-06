// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import s3 from '@/lib/s3Client';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('file') as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
  }

  const uploadedFileUrls: string[] = [];

  const bucketName = process.env.AWS_S3_BUCKET;

    if (!bucketName) {
        console.error("Missing AWS_S3_BUCKET env variable");
        return NextResponse.json({ error: "S3 bucket is not configured" }, { status: 500 });
    }


  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = `${uuidv4()}-${file.name}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    };

    await s3.upload(uploadParams).promise();
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    uploadedFileUrls.push(fileUrl);
  }

  return NextResponse.json({ files: uploadedFileUrls });
}
