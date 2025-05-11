import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromNodeProviderChain(),
});

export async function POST(req: NextRequest) {
    debugger;
    const { jobs } = await req.json();
    console.log("here");

    if (!Array.isArray(jobs)) {
        return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
    }

    const zip = new JSZip();

    for (const job of jobs) {
        const { key, filename } = job;

        console.log(key, job);
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        });

        try {
            const { Body } = await s3.send(command);

            const buffer = await streamToBuffer(Body as Readable);
            zip.file(filename, buffer);
        } catch (err) {
            console.error(`Failed to fetch ${key}:`, err);
        }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const zipKey = `downloads/qrcodes-${uuidv4()}.zip`;

    // Upload ZIP to S3
    await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: zipKey,
        Body: zipBuffer,
        ContentType: 'application/zip',
    }));

    const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: zipKey,
    }), { expiresIn: 60 * 5 });

    return NextResponse.json({ url });
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: (Uint8Array | Buffer)[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}
