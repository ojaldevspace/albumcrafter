// app/api/saveAlbum/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/app/lib/s3Client';
import { generateStyledQRCode } from '@/app/lib/generateStyledQrCode';
import { formatToCustomDate } from '../utils/apiHelper';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: fromNodeProviderChain(),
});

async function uploadQrCodeToS3(qrCodeKey: string, qrCodeDataUrl: string) {
  const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: qrCodeKey,
    Body: buffer,
    ContentEncoding: 'base64',
    ContentType: 'image/png',
  });

  await s3.send(command);

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${qrCodeKey}`;
}

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
      eventDate,
    } = data;
    
    const protocol = req.headers.get('host')?.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${req.headers.get('host')}`;
    const createdAtOnlyDate = createdAt.split('T')[0];

    const id = uuidv4();

    const flipbookUrl = `${baseUrl}/flipbook/view?jobId=${id}`;
    const eventDateFriendly = formatToCustomDate(eventDate);
    const qrCodeDataUrl = await generateStyledQRCode(flipbookUrl, jobName, eventDateFriendly);
    const qrCodeKey = `${createdAtOnlyDate}/${jobNumber}/${id}.png`;

    await uploadQrCodeToS3(qrCodeKey, qrCodeDataUrl);

    const params = {
      TableName: 'JobInformation',
      Item: {
        id: { S: id },
        jobNumber: { S: jobNumber },
        jobName: { S: jobName },
        jobType: { S: jobType },
        photographer: { S: photographer },
        location: { S: location },
        eventDate: { S: eventDate},
        createdAt: { S: createdAt },
        imageUrls: { L: imageUrls.map((url: string) => ({ S: url })) },
        qrCodeUrl: { S: qrCodeKey},
        dealerName: { S: dealerName },
        dealerMobileNumber: { S: dealerMobileNumber },
      },
    };

    const command = new PutItemCommand(params);
    await client.send(command);

    return NextResponse.json({ message: 'Data saved successfully', id, qrCodeKey }, { status: 200 });
  } catch (error: unknown) {
    console.error('DynamoDB error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }

}
