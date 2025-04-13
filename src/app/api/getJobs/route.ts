import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const REGION = process.env.NEXT_PUBLIC_REGION;

const client = new DynamoDBClient({
    region: REGION,
  });

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, lastEvaluatedKey, limit = 10 } = await req.json();
   
    const ddb = DynamoDBDocumentClient.from(client);

    // If filtering by date
    if (startDate && endDate) {
      const startTimestamp = new Date(startDate).toISOString();
      const endTimestamp = new Date(endDate).toISOString();

      const scanResult = await ddb.send(
        new ScanCommand({
          TableName: 'JobList',
          FilterExpression: 'createdAt BETWEEN :start AND :end',
          ExpressionAttributeValues: {
            ':start': startTimestamp,
            ':end': endTimestamp,
          },
          Limit: limit,
          ExclusiveStartKey: lastEvaluatedKey || undefined,
        })
      );

      const sorted = (scanResult.Items || []).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json({
        jobs: sorted,
        lastEvaluatedKey: scanResult.LastEvaluatedKey || null,
      });
    }

    // If no date filter, return latest items by createdAt
    const result = await ddb.send(
      new ScanCommand({
        TableName: 'JobList',
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey || undefined,
      })
    );

    const sortedItems = (result.Items || []).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    console.log('Creds:', await client.config.credentials());

    return NextResponse.json({
      jobs: sortedItems,
      lastEvaluatedKey: result.LastEvaluatedKey || null,
    });
  } catch (error: unknown) {
    console.error('DynamoDB error:', error);
  
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message}, { status: 500 });
    }
  
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
  
}
