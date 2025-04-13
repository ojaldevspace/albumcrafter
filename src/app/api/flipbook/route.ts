// src/app/api/flipbook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import s3 from '@/lib/s3Client';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(req: NextRequest) {
    const key = req.nextUrl.searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET ?? 'albumcrafter1',
            Key: key,
        });

        const s3Response = await s3.send(command);
        const stream = s3Response.Body as ReadableStream;
        const contentType = s3Response.ContentType || 'application/octet-stream';

        return new NextResponse(stream, {
            status: 200,
            headers: { 'Content-Type': contentType },
        });
    } catch (err) {
        console.error('S3 read error:', err);
        return NextResponse.json({ error: 'Flipbook not found' }, { status: 404 });
    }
}
