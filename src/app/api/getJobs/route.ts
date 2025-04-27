import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { createdAt } = await req.json();

    if (!createdAt) {
      return NextResponse.json({ error: 'Missing createdAt parameter' }, { status: 400 });
    }

    const params = {
      TableName: 'JobInformation',
      FilterExpression: '#createdAt >= :createdAt',
      ExpressionAttributeNames: {
        '#createdAt': 'createdAt',
      },
      ExpressionAttributeValues: {
        ':createdAt': { S: createdAt },
      },
    };

    const data = await client.send(new ScanCommand(params));
    const jobs = data.Items?.map((item) => unmarshall(item)) || [];

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('DynamoDB Scan error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

