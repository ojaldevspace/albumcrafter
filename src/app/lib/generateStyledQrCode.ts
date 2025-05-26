import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export async function generateStyledQRCodeSVG(
  flipbookUrl: string,
  jobName: string,
  eventDate: string,
  jobNumber: string
): Promise<string> {
  // Generate QR code as SVG
  const qrSvg = await QRCode.toString(flipbookUrl, {
    type: 'svg',
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Embed header image (Base64)
  const headerImagePath = path.resolve(process.cwd(), 'public/assets/images/scanGoogle.jpeg');
  const headerImageBuffer = fs.readFileSync(headerImagePath);
  const headerImageBase64 = headerImageBuffer.toString('base64');
  const headerImageDataUri = `data:image/jpeg;base64,${headerImageBase64}`;

  // Embed Times New Roman font
  const fontPath = path.resolve(process.cwd(), 'assets/fonts/times.ttf');
  const fontBase64 = fs.readFileSync(fontPath).toString('base64');

  // SVG wrapper with embedded font and scalable layout
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'TimesNewRomanEmbedded';
        src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
      }
      .text {
        font-family: 'TimesNewRomanEmbedded', 'Times New Roman', serif;
        fill: #666;
        font-size: 20px;
        text-anchor: middle;
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="white" />

  <!-- Header image -->
  <image href="${headerImageDataUri}" x="100" y="20" width="200" height="60" />

  <!-- QR code -->
  <g transform="translate(50, 100)">
    ${qrSvg}
  </g>

  <!-- Footer Text -->
  <text x="200" y="440" class="text">B-${jobNumber}</text>
  <text x="200" y="470" class="text">${jobName}</text>
  <text x="200" y="500" class="text">${eventDate}</text>
</svg>
`;

  return svg;
}
