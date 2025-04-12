import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3Client';
import { v4 as uuidv4 } from 'uuid';
import generateFlipbook from '@/lib/generateFlipbook';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    let isCropped = false;
    let flipbookHtml = '';
    const { imageUrls, jobNumber, createdAt } = await req.json();
    if (!imageUrls || imageUrls.length < 2) {
        return NextResponse.json({ error: 'At least 2 images required' }, { status: 400 });
    }

    const sortedImageUrls: string[] = imageUrls.sort();

    const frontCoverImg = await fetch(sortedImageUrls[0]);
    const arrayBuffer = await frontCoverImg.arrayBuffer();
    const frontCoverImgbuffer = Buffer.from(arrayBuffer);
    const frontCoverImgmetadata = await sharp(frontCoverImgbuffer).metadata();
    const aspectRatio = frontCoverImgmetadata.width && frontCoverImgmetadata.height ? frontCoverImgmetadata.width / frontCoverImgmetadata.height: 1;

    const firstPageImg = await fetch(sortedImageUrls[1]);
    const firstPageImgarrayBuffer = await firstPageImg.arrayBuffer();
    const firstPageImgbuffer = Buffer.from(firstPageImgarrayBuffer);
    const firstPageImgmetadata = await sharp(firstPageImgbuffer).metadata();
    const firstPageAspectRatio = firstPageImgmetadata.width && firstPageImgmetadata.height ? firstPageImgmetadata.width / firstPageImgmetadata.height : 1;

    const secondPageImg = await fetch(sortedImageUrls[2]);
    const secondPageImgarrayBuffer = await secondPageImg.arrayBuffer();
    const secondPageImgbuffer = Buffer.from(secondPageImgarrayBuffer);
    const secondPageImgmetadata = await sharp(secondPageImgbuffer).metadata();
    const secondPageAspectRatio = secondPageImgmetadata.width && secondPageImgmetadata.height ? secondPageImgmetadata.width/secondPageImgmetadata.height : 1;

    debugger;
    if(aspectRatio != firstPageAspectRatio){
        isCropped = false;
        flipbookHtml = generateFlipbook(sortedImageUrls, sortedImageUrls.length, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], aspectRatio, isCropped);
    }
    else if(firstPageAspectRatio != secondPageAspectRatio){
        isCropped = false;
        flipbookHtml = generateFlipbook(sortedImageUrls.slice(1), sortedImageUrls.length-1, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], aspectRatio, isCropped);
    }
    else{
        isCropped = true;
        const numPages = (sortedImageUrls.length-1)%2===0 ? ((sortedImageUrls.length-1)/2) : sortedImageUrls.length/2
        flipbookHtml = generateFlipbook(sortedImageUrls.slice(1), numPages, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], aspectRatio, isCropped);
    }

    const flipbookKey = `${createdAt}/${jobNumber}/flipbooks/${uuidv4()}.html`;

    await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: flipbookKey,
        Body: flipbookHtml,
        ContentType: 'text/html',
    }));

    const flipbookUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${flipbookKey}`;
    return NextResponse.json({ flipbookUrl });
}
