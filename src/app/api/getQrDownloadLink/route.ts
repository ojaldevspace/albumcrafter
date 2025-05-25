import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromNodeProviderChain(),
});

export async function POST(req: NextRequest) {
  try {

    const { qrPageInfo } = await req.json();

    if(!qrPageInfo){
      return NextResponse.json({ error: 'Missing key or filename' }, { status: 400 });
    }

    const { key, filename } = await req.json();

    if (!key || !filename) {
      return NextResponse.json({ error: 'Missing key or filename' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 seconds

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
  }
}
