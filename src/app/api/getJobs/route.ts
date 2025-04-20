// import { NextRequest, NextResponse } from 'next/server';
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
// import {
//   DynamoDBDocumentClient,
//   ScanCommand,
// } from '@aws-sdk/lib-dynamodb';


// const client = new DynamoDBClient({
//     region: process.env.AWS_REGION,
//   });

// export async function POST(req: NextRequest) {
//   try {
//     console.log('begin');
//     console.log('Creds:', await client.config.credentials());
//     console.log('Bucket',process.env.AWS_S3_BUCKET);
//     console.log('AccessKey', process.env.AWS_ACCESS_KEY_ID);
//     console.log('Region', process.env.AWS_REGION);
//     console.log('hello');
//     const { startDate, endDate, lastEvaluatedKey, limit = 10 } = await req.json();
   
//     const ddb = DynamoDBDocumentClient.from(client);

//     // If filtering by date
//     if (startDate && endDate) {
//       const startTimestamp = new Date(startDate).toISOString();
//       const endTimestamp = new Date(endDate).toISOString();

//       const scanResult = await ddb.send(
//         new ScanCommand({
//           TableName: 'JobList',
//           FilterExpression: 'createdAt BETWEEN :start AND :end',
//           ExpressionAttributeValues: {
//             ':start': startTimestamp,
//             ':end': endTimestamp,
//           },
//           Limit: limit,
//           ExclusiveStartKey: lastEvaluatedKey || undefined,
//         })
//       );

//       const sorted = (scanResult.Items || []).sort((a, b) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       );

//       return NextResponse.json({
//         jobs: sorted,
//         lastEvaluatedKey: scanResult.LastEvaluatedKey || null,
//       });
//     }

//     // If no date filter, return latest items by createdAt
//     const result = await ddb.send(
//       new ScanCommand({
//         TableName: 'JobList',
//         Limit: limit,
//         ExclusiveStartKey: lastEvaluatedKey || undefined,
//       })
//     );

//     const sortedItems = (result.Items || []).sort((a, b) =>
//       new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     return NextResponse.json({
//       jobs: sortedItems,
//       lastEvaluatedKey: result.LastEvaluatedKey || null,
//     });
//   } catch (error: unknown) {
//     console.error('DynamoDB error:', error);
  
//     if (error instanceof Error) {
//       return NextResponse.json({ error: error.message}, { status: 500 });
//     }
  
//     return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
//   }
  
// }


import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export async function GET() {
  try {
    const data = await client.send(
      new ScanCommand({ TableName: 'JobList' })
    );

    const jobs = data.Items?.map(item => unmarshall(item)) || [];

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('DynamoDB error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
