// app/api/saveAlbum/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      jobNumber,
      jobName,
      jobType,
      photographer,
      location,
      imageUrls,
    } = data;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const params = {
      TableName: 'JobList',
      Item: {
        id: { S: id },
        jobNumber: { S: jobNumber },
        jobName: { S: jobName },
        jobType: { S: jobType },
        photographer: { S: photographer },
        location: { S: location },
        createdAt: { S: createdAt },
        imageUrls: { L: imageUrls.map((url: string) => ({ S: url })) },
      },
    };

    const command = new PutItemCommand(params);
    await client.send(command);

    return NextResponse.json({ message: 'Data saved successfully', id }, { status: 200 });
  } catch (error: any) {
    console.error('DynamoDB error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
