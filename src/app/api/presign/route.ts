import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import s3 from '@/app/lib/s3Client';


export async function POST(req: NextRequest) {
  const { fileName, fileType, jobNumber } = await req.json();

  if (!fileName || !fileType || !jobNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const uploadDate = new Date().toISOString().split('T')[0];
  const key = `${uploadDate}/${jobNumber}/images/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 minute

  const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return NextResponse.json({ url, imageUrl });
}
