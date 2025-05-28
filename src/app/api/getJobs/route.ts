import { NextRequest, NextResponse } from 'next/server';
import { AttributeValue, DynamoDBClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { createdAt } = await req.json();

    if (!createdAt) {
      return NextResponse.json({ error: 'Missing createdAt parameter' }, { status: 400 });
    }

    const startDate = new Date(createdAt);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const startISOString = startDate.toISOString();
    const endISOString = endDate.toISOString();

    const params = {
      TableName: 'AlbumJobInformation',
      FilterExpression: '#createdAt BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#createdAt': 'createdAt',
      },
      ExpressionAttributeValues: {
        ':start': { S: startISOString },
        ':end': { S: endISOString },
      },
    };

    let items: any[] = [];
    let lastKey = undefined;

    do {
      const data: ScanCommandOutput = await client.send(
        new ScanCommand({
          ...params,
          ExclusiveStartKey: lastKey,
        })
      );

      if (data.Items) {
        items = items.concat(data.Items.map((item: AttributeValue | Record<string, AttributeValue>) => unmarshall(item)));
      }

      lastKey = data.LastEvaluatedKey;
    } while (lastKey);

    const sortedItems = items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sortedItems);
  } catch (error) {
    console.error('DynamoDB Scan error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
