// pages/api/updateJob.ts
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { NextRequest, NextResponse } from 'next/server';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {

    const { id, createdAt, jobName, dealerName, dealerMobileNumber, location, eventDate } = await req.json();

    try {
        const command = new UpdateItemCommand({
            TableName: 'AlbumJobInformation',
            Key: marshall({ id, createdAt }),
            UpdateExpression: 'SET jobName = :jn, dealerName = :dn, dealerMobileNumber = :dm, #loc = :loc, eventDate = :ed',
            ExpressionAttributeNames: {
                '#loc': 'location',
            },
            ExpressionAttributeValues: marshall({
                ':jn': jobName,
                ':dn': dealerName,
                ':dm': dealerMobileNumber,
                ':loc': location,
                ':ed': eventDate,
            }),
        });

        await client.send(command);
        return NextResponse.json({});
    } catch (err) {
        console.error('Update failed:', err);
        return NextResponse.json({ error: 'Update failed' });
    }
}
