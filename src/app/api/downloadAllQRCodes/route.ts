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
    const { jobs } = await req.json();
    console.log("here");

    if (!Array.isArray(jobs)) {
        return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
    }

    const zip = new JSZip();

    for (const job of jobs) {
        const { key, filename } = job;

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


// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { PDFDocument } from 'pdf-lib';
// import { NextRequest, NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';
// import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
// import { generateStyledQRCode } from '@/app/lib/generateStyledQrCode';
// import { QRPageInfo } from '@/types/QRPageInfo';

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: fromNodeProviderChain(),
// });


// export async function POST(req: NextRequest) {
//   const { jobs }: { jobs: QRPageInfo[] } = await req.json();
//     debugger;
//   if (!Array.isArray(jobs)) {
//     return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
//   }

//   try {
//     const pdfDoc = await PDFDocument.create();
//     const PAGE_WIDTH = 864;   // 12in * 72
//     const PAGE_HEIGHT = 1296; // 18in * 72

//     for (const job of jobs) {
//       const { id, jobName, eventDate, jobNumber } = job;

//       const dataUrl = await generateStyledQRCode(id, jobName, eventDate, jobNumber);
//       const base64 = dataUrl.split(',')[1];
//       const buffer = Buffer.from(base64, 'base64');

//       const image = await pdfDoc.embedPng(buffer);
//       const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

//       const x = (PAGE_WIDTH - image.width) / 2;
//       const y = (PAGE_HEIGHT - image.height) / 2;

//       page.drawImage(image, {
//         x,
//         y,
//         width: image.width,
//         height: image.height,
//       });
//     }

//     const pdfBytes = await pdfDoc.save();

//     const pdfKey = `downloads/qrcodes-${uuidv4()}.pdf`;

//     await s3.send(new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: pdfKey,
//       Body: Buffer.from(pdfBytes),
//       ContentType: 'application/pdf',
//     }));

//     const url = await getSignedUrl(s3, new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: pdfKey,
//     }), { expiresIn: 60 * 5 });

//     return NextResponse.json({ url });
//   } catch (err) {
//     console.error('PDF generation failed:', err);
//     return NextResponse.json({ error: 'QR code PDF generation failed' }, { status: 500 });
//   }
// }
