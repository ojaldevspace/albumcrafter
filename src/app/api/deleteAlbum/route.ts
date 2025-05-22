// app/api/deleteAlbum/route.ts

import { NextRequest, NextResponse } from 'next/server';
import s3 from '@/app/lib/s3Client';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { FlipBookData } from '@/types/FlipbookData';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);


export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing job number' }, { status: 400 });
    }

    // 1. Get album metadata from DynamoDB
    const command = new QueryCommand({
            TableName: 'AlbumJobInformation',
            KeyConditionExpression: 'id = :jobId',
            ExpressionAttributeValues: {
                ':jobId': { S: jobId },
            },
        });
    
    const result = await docClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
            return NextResponse.json({ error: 'No job found for given id' }, { status: 404 });
        }
    
    const jobs = result.Items?.map(item => unmarshall(item) as FlipBookData) || [];
    const latestJob = jobs[0];

    // 3. Extract S3 object keys from URLs
    const keysToDelete = latestJob.imageUrls.map((url) => {
      const match = url.match(/amazonaws\.com\/(.+)$/);
      const key = match ? decodeURIComponent(match[1]) : null;
      return key ? { Key: key } : null;
    }).filter(Boolean) as { Key: string }[];

    // 4. Delete images from S3
    if (keysToDelete.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Delete: {
            Objects: keysToDelete,
            Quiet: false,
          },
        })
      );
    }

    // 5. Delete the album from DynamoDB
    await client.send(
      new DeleteCommand({
        TableName: 'AlbumJobInformation',
        Key: {
            id: latestJob.id,
            createdAt: latestJob.createdAt, // Replace with your actual sort key name
          },
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting album:', err);
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
