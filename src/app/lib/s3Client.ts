// lib/s3Client.ts
import { S3Client } from '@aws-sdk/client-s3';
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_REGION,
  credentials: fromNodeProviderChain(),
});

export default s3Client;
