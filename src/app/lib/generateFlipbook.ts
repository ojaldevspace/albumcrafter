import { FlipBookData } from "@/types/FlipbookData"

export default function generateFlipbook(
    jobs: FlipBookData) {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head class="head">
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title></title>
            <link rel="stylesheet" href="/flipbook.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        </head>
        <body id="body">
            <div class="background"></div>
            <header>
                <div class="logo">
                    <h2>${jobs.dealerName}</h2>
                </div>
                <div class="client">
                    ${jobs.jobName}
                    <br>
                    ${jobs.eventDateFriendly}
                </div>
                <div class="eventInformation">
                    <p>
                    <img class="location-icon" alt="location" src="/location.svg">
                    <span>${jobs.location}</span>
                    <p>
                        <img class="location-icon" alt="phone" src="/phone.svg">
                        <a 
                            href="https://wa.me/${jobs.dealerMobileNumber.replace(/\D/g, '')}" 
                            target="_blank" 
                            style="color: inherit; text-decoration: none;"
                        >
                            ${jobs.dealerMobileNumber}
                        </a>
                    </p>
                </div>
            </header>
            <div class="main">
                <div class="flipbook" id="flipbook"></div>
                <div class="actions">
                    <span id="playBtn" class="btn play"><img src="/play.svg" class="share"></span>
                    <span id="shareBtn" class="btn"><img src="/share.svg" class="share"></span>
                    <span id="fullScreenButton" class="btn fullscreen"><img src="/fullscreen.svg" class="share"></span>
                </div>
                
            </div>
            <script>
                const sheets = ${JSON.stringify(jobs.imageUrls)};
                const numPages = ${jobs.numPages};
                const pageOrientation = ${jobs.aspectRatio > 1 ? JSON.stringify('landscape') : JSON.stringify('portrait')};;
                const frontCoverImg = "${jobs.frontCoverUrl}";
                const backCoverImg = "${jobs.backCoverUrl}";
                const pageRatio = ${JSON.stringify(jobs.aspectRatio)};
                const isCropped = ${jobs.isCropped};
            </script>
            <script src="/flipbook.js"></script>
        </body>
    </html>
    `
}