import { NextRequest, NextResponse } from 'next/server';
import generateFlipbook from '@/app/lib/generateFlipbook';
import sharp from 'sharp';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { FlipBookData } from '@/types/FlipbookData';
import { formatToCustomDate } from '../utils/apiHelper';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function getAspectRatio(imgUrl: string): Promise<number> {
    try {
        const response = await fetch(imgUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${imgUrl}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const metadata = await sharp(buffer).metadata();

        if (metadata.width && metadata.height) {
            return metadata.width / metadata.height;
        } else {
            return 1; // fallback if width/height missing
        }
    } catch (error) {
        console.error('Error getting aspect ratio:', error);
        return 1; // fallback on error
    }
}

export async function POST(req: NextRequest) {
    const { jobId } = await req.json();

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


    latestJob.imageUrls = latestJob.imageUrls.sort();
    latestJob.eventDateFriendly = formatToCustomDate(latestJob?.eventDate);
    const imageUrlCount = latestJob.imageUrls.length;

    latestJob.frontCoverUrl = latestJob.imageUrls[0];
    latestJob.backCoverUrl = latestJob.imageUrls[imageUrlCount - 1];

    const coveraspectRatio = await getAspectRatio(latestJob.imageUrls[0]);

    latestJob.aspectRatio = coveraspectRatio;
    const firstPageAspectRatio = await getAspectRatio(latestJob.imageUrls[1]);
    const secondPageAspectRatio = await getAspectRatio(latestJob.imageUrls[2]);

    const backCoverAspectRatio = await getAspectRatio(latestJob.imageUrls[latestJob.imageUrls.length - 1]);
    const lastPageAspectRatio = await getAspectRatio(latestJob.imageUrls[latestJob.imageUrls.length - 2]);

    if (coveraspectRatio != firstPageAspectRatio) {
        latestJob.isCropped = false;
        if (lastPageAspectRatio != backCoverAspectRatio) {
            latestJob.numPages = imageUrlCount - 1;
        }
        else {
            latestJob.numPages = imageUrlCount - 2;
            latestJob.imageUrls = latestJob.imageUrls.slice(0, -1);
        }
    }
    else if (firstPageAspectRatio != secondPageAspectRatio) {
        latestJob.isCropped = false;
        if (lastPageAspectRatio != backCoverAspectRatio) {
            latestJob.numPages = imageUrlCount - 2;
            latestJob.imageUrls = latestJob.imageUrls.slice(1);
        }
        else {
            latestJob.numPages = imageUrlCount - 3;
            latestJob.imageUrls = latestJob.imageUrls.slice(1, -1);
        }
    }
    else {
        latestJob.isCropped = true;
        const numPages = (imageUrlCount - 1) % 2 === 0 ? ((imageUrlCount - 1) / 2) + 1 : imageUrlCount / 2
        latestJob.numPages = numPages - 1;
        if ((imageUrlCount - 1) % 2 === 0) {
            latestJob.imageUrls = latestJob.imageUrls.slice(1);
        }
        else {
            latestJob.imageUrls = latestJob.imageUrls.slice(1, -1);
        }
    }
    const flipbookHtml = generateFlipbook(latestJob);

    return NextResponse.json({ flipbookHtml });
}
