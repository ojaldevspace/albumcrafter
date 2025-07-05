import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PDFDocument } from "pdf-lib";

const s3 = new S3Client({ region: process.env.AWS_REGION! });

const SRC_BUCKET = process.env.AWS_S3_BUCKET!;   // PNGs live here
const DEST_BUCKET = process.env.AWS_S3_BUCKET!;     // PDF lives here
const PAGE_W = 1800;   // 3 : 4 aspect (600 × 800 pt ≈ 8.3″×11.1″)
const PAGE_H = 1200;
const MARGIN = 350;

export async function POST(req: NextRequest) {
    if (req.method !== "POST") {
        // (Not strictly needed—App Router only calls POST here—but it’s defensive.)
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // -------- 1. Parse body ----------------------------------------------------
    let body: { jobs: { key: string; filename: string }[]; selectedDate: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { jobs, selectedDate } = body ?? {};
    if (!Array.isArray(jobs) || jobs.length === 0) {
        return NextResponse.json({ error: "No jobs supplied" }, { status: 422 });
    }

    // -------- 2. Fetch all PNGs from S3 (parallel) -----------------------------
    const pngBuffers = await Promise.all(
        jobs.map(async ({ key }) => {
            const obj = await s3.send(new GetObjectCommand({ Bucket: SRC_BUCKET, Key: key }));
            // Node 18 + fetch polyfill: transformToByteArray() yields Uint8Array
            if (!obj.Body) {
                throw new Error(`No body returned for key: ${key}`);
            }
            return Buffer.from(await obj.Body.transformToByteArray());
        })
    );

    // -------- 3. Build the PDF -------------------------------------------------
    const pdf = await PDFDocument.create();
    for (const pngBytes of pngBuffers) {
        const page = pdf.addPage([PAGE_W, PAGE_H]);
        const image = await pdf.embedPng(pngBytes);
        const { width, height } = image.scale(0.25);

        const scale = Math.min(
            (PAGE_W - 2 * MARGIN) / width,
            (PAGE_H - 2 * MARGIN) / height
        );
        const imgW = width * scale;
        const imgH = height * scale;

        page.drawImage(image, {
            x: (PAGE_W - imgW) / 2,
            y: (PAGE_H - imgH) / 2,
            width: imgW,
            height: imgH,
        });
    }

    const pdfBytes = await pdf.save();

    // -------- 4. Upload & presign ---------------------------------------------
    const outKey = `qr‑pdfs/${selectedDate}/${crypto.randomUUID()}.pdf`;

    await s3.send(
        new PutObjectCommand({
            Bucket: DEST_BUCKET,
            Key: outKey,
            Body: pdfBytes,
            ContentType: "application/pdf",
            ContentDisposition: 'attachment; filename="all-qrcodes.pdf"'
        })
    );

    const desiredName = `${selectedDate}.pdf`;

    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: DEST_BUCKET, Key: outKey, ResponseContentDisposition: `attachment; filename="${desiredName}"`,
            ResponseContentType: "application/pdf"
        }),
        { expiresIn: 3600 } // 1 hour
    );

    // -------- 5. Return JSON ---------------------------------------------------
    return NextResponse.json({ url }, { status: 200 });
}
