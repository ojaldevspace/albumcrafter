// lib/s3Client.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: process.env.REGION, // e.g. 'us-east-1'
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

export default s3;
