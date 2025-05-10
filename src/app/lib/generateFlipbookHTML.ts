export default function generateFlipbookHTML(imageUrls: string[]) {
  const pagesHtml = imageUrls.flatMap((url, idx) => {
    return [
      `
      <div class="page">
        <img src="${url}" alt="Page ${idx * 2 + 1}" class="left-half" />
      </div>
      `,
      `
      <div class="page">
        <img src="${url}" alt="Page ${idx * 2 + 2}" class="right-half" />
      </div>
      `
    ];
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Flipbook</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: #ccc;
        }

        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          position: relative;
        }

        .flipbook {
          position: relative;
          box-shadow: 0 0 20px rgba(0,0,0,0.3);
        }

        .page {
          background: white;
          overflow: hidden;
          position: relative;
        }

        .page img {
          width: 200%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .left-half {
          object-position: left center;
        }

        .right-half {
          object-position: right center;
        }

        .fullscreen-btn {
          position: absolute;
          top: 15px;
          right: 20px;
          z-index: 1000;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
        }

        .page-counter {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(0,0,0,0.5);
          color: #fff;
          padding: 5px 10px;
          font-size: 14px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <button class="fullscreen-btn">Fullscreen</button>
        <div class="flipbook">
          ${pagesHtml}
        </div>
        <div class="page-counter">Page 1 of ${imageUrls.length * 2}</div>
      </div>

      <!-- Load jQuery -->
      <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

      <!-- Load Turn.js (your uploaded S3 version) -->
      <script src="https://albumcrafter1.s3.amazonaws.com/libs/turn.min.js"></script>

      <script>
        $(document).ready(function () {
          const $flipbook = $('.flipbook');
          const $pageCounter = $('.page-counter');

          const firstImg = $flipbook.find('img').get(0);
          const img = new Image();
          img.src = firstImg.src;

          img.onload = () => {
            const updateDimensions = () => {
              const originalWidth = img.naturalWidth / 2; // single page width
              const originalHeight = img.naturalHeight;

              const maxWidth = window.innerWidth * 0.9;
              const maxHeight = window.innerHeight * 0.9;

              let targetWidth = originalWidth;
              let targetHeight = originalHeight;

              if (targetWidth > maxWidth) {
                const scale = maxWidth / targetWidth;
                targetWidth *= scale;
                targetHeight *= scale;
              }

              if (targetHeight > maxHeight) {
                const scale = maxHeight / targetHeight;
                targetWidth *= scale;
                targetHeight *= scale;
              }

              targetWidth = Math.round(targetWidth);
              targetHeight = Math.round(targetHeight);

              $flipbook.css({
                width: targetWidth * 2 + 'px',
                height: targetHeight + 'px'
              });

              $('.page').css({
                width: targetWidth + 'px',
                height: targetHeight + 'px'
              });

              if (!$flipbook.data('turn')) {
                $flipbook.turn({
                  width: targetWidth * 2,
                  height: targetHeight,
                  autoCenter: true
                });

                $flipbook.bind('turned', function (event, page, view) {
                  $pageCounter.text('Page ' + page + ' of ${imageUrls.length * 2}');
                });

                $flipbook.on('click', '.page', function (e) {
                  const offset = $(this).offset();
                  const x = e.pageX - offset.left;

                  if (x < $(this).width() / 2) {
                    $flipbook.turn('previous');
                  } else {
                    $flipbook.turn('next');
                  }
                });
              } else {
                $flipbook.turn('size', targetWidth * 2, targetHeight);
              }
            };

            updateDimensions();
            $(window).on('resize', updateDimensions);
          };

          $('.fullscreen-btn').on('click', function () {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
              elem.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          });
        });
      </script>
    </body>
    </html>
  `;
}
