import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/app/lib/s3Client';
import { v4 as uuidv4 } from 'uuid';
import generateFlipbook from '@/app/lib/generateFlipbook';
import sharp from 'sharp';

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
    let isCropped = false;
    let flipbookHtml = '';
    const { imageUrls, jobNumber, createdAtOnlyDate } = await req.json();
    if (!imageUrls || imageUrls.length < 4) {
        return NextResponse.json({ error: 'At least 4 images required' }, { status: 400 });
    }

    const sortedImageUrls: string[] = imageUrls.sort();

    const coveraspectRatio = await getAspectRatio(sortedImageUrls[0]);
    const firstPageAspectRatio = await getAspectRatio(sortedImageUrls[1]);
    const secondPageAspectRatio = await getAspectRatio(sortedImageUrls[2]);

    const backCoverAspectRatio = await getAspectRatio(sortedImageUrls[sortedImageUrls.length-1]);
    const lastPageAspectRatio = await getAspectRatio(sortedImageUrls[sortedImageUrls.length-2]);

    debugger;
    if(coveraspectRatio != firstPageAspectRatio){
        isCropped = false;
        if(lastPageAspectRatio != backCoverAspectRatio)
            flipbookHtml = generateFlipbook(sortedImageUrls, sortedImageUrls.length-1, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], coveraspectRatio, isCropped);
        else
            flipbookHtml = generateFlipbook(sortedImageUrls.slice(0,-1), sortedImageUrls.length-2, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length-1], coveraspectRatio, isCropped);
    }
    else if(firstPageAspectRatio != secondPageAspectRatio){
        isCropped = false;
        if(lastPageAspectRatio != backCoverAspectRatio)
            flipbookHtml = generateFlipbook(sortedImageUrls.slice(1), sortedImageUrls.length-2, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], coveraspectRatio, isCropped);
        else
            flipbookHtml = generateFlipbook(sortedImageUrls.slice(1,-1), sortedImageUrls.length-3, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], coveraspectRatio, isCropped);
    }
    else{
        isCropped = true;
        const numPages = (sortedImageUrls.length-1)%2===0 ? ((sortedImageUrls.length-1)/2)+1: sortedImageUrls.length/2
        if((sortedImageUrls.length-1)%2 === 0)
            flipbookHtml = generateFlipbook(sortedImageUrls.slice(1), numPages-1, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], coveraspectRatio, isCropped);
        else
            flipbookHtml = generateFlipbook(sortedImageUrls.slice(1,-1), numPages-1, sortedImageUrls[0], sortedImageUrls[sortedImageUrls.length - 1], coveraspectRatio, isCropped);
    }

    const flipbookKey = `${createdAtOnlyDate}/${jobNumber}/flipbooks/${uuidv4()}.html`;

    await s3.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: flipbookKey,
        Body: flipbookHtml,
        ContentType: 'text/html',
    }));

    return NextResponse.json({ flipbookKey });
}
