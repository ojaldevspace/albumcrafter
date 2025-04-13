// app/api/saveAlbum/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_REGION,
  credentials: fromNodeProviderChain(),
});

export async function POST(req: NextRequest) {
  debugger;
  try {
    const data = await req.json();

    const {
      jobNumber,
      jobName,
      jobType,
      photographer,
      location,
      imageUrls,
      createdAt,
      dealerName,
      dealerMobileNumber,
    } = data;

    // STEP 1: Generate the flipbook URL
    const flipbookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/createFlipbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrls, jobNumber, createdAt }),
    });

    if (!flipbookResponse.ok) {
      throw new Error('Failed to create flipbook');
    }

    const { flipbookUrl } = await flipbookResponse.json();

    const id = uuidv4();

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
        flipbookUrl: { S: flipbookUrl },
        dealerName: { S: dealerName },
        dealerMobileNumber: { S: dealerMobileNumber },
      },
    };

    const command = new PutItemCommand(params);
    await client.send(command);

    return NextResponse.json({ message: 'Data saved successfully', id, flipbookUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error('DynamoDB error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }

}
