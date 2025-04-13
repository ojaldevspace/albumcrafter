// lib/s3Client.ts
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_ACCESS_SECRET_KEY || '',
  },
});

export default s3Client;
