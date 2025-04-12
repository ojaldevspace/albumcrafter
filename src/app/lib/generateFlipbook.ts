export default function generateFlipbook(
    imageUrls: string[],
    numPages: number,
    frontCoverUrl: string,
    backCoverUrl: string,
    aspectRatio: number,
    isCropped: boolean){
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head class="head">
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title></title>
            <link rel="stylesheet" href="/flipbook.css">
        </head>
        <body id="body">
            <div class="main">
                <div class="flipbook" id="flipbook"></div>
            </div>
            <script>
                const sheets = ${JSON.stringify(imageUrls)};
                const numPages = ${numPages};
                const pageOrientation = ${aspectRatio>1 ? JSON.stringify('landscape') : JSON.stringify('portrait')};;
                const frontCoverImg = "${frontCoverUrl}";
                const backCoverImg = "${backCoverUrl}";
                const pageRatio = ${JSON.stringify(aspectRatio)};
                const isCropped = ${isCropped};
            </script>
            <script src="/flipbook.js"></script>
        </body>
    </html>
    `
}