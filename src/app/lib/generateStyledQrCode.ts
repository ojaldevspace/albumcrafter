import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import TextToSVG from 'text-to-svg';

export async function generateStyledQRCodeSVG(
  flipbookUrl: string,
  jobName: string,
  eventDate: string,
  jobNumber: string
): Promise<string> {
  // Load font for text-to-svg
  const fontPath = path.resolve(process.cwd(), 'assets/fonts/DMSerifText-Regular.ttf');
  const textToSVG = TextToSVG.loadSync(fontPath);
  const fontSize = 20;

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

  // Load header image
  const headerImagePath = path.resolve(process.cwd(), 'public/assets/images/scanGoogle.jpeg');
  const headerImageBuffer = fs.readFileSync(headerImagePath);
  const headerImageBase64 = headerImageBuffer.toString('base64');
  const headerImageDataUri = `data:image/jpeg;base64,${headerImageBase64}`;

  // Utility to get centered path, default width = 400 (whole svg width)
  const generateCenteredPath = (text: string, y: number, width = 400) => {
    const metrics = textToSVG.getMetrics(text, { fontSize });
    const x = (width - metrics.width) / 2;
    const d = textToSVG.getD(text, {
      x: 0,
      y: 0,
      fontSize,
      attributes: { fill: '#666' },
    });
    return `<path d="${d}" transform="translate(${x}, ${y})" />`;
  };

  // Generate footer texts centered in full SVG width
  const jobNamePath = generateCenteredPath(jobName, 430);
  const eventDatePath = generateCenteredPath(eventDate, 460);

  // Generate jobNumber path centered inside QR code (300px width)
  // Use slightly bigger font for jobNumber inside QR code
  const jobNumberFontSize = 25;
  const jobNumberMetrics = textToSVG.getMetrics(`B-${jobNumber}`, { fontSize: jobNumberFontSize });
  const jobNumberD = textToSVG.getD(`B-${jobNumber}`, {
    x: 0,
    y: 0,
    fontSize: jobNumberFontSize,
    attributes: { fill: '#000' },
  });
  // Center within 300px QR code
  const jobNumberX = (300 - jobNumberMetrics.width) / 2;
  // Vertically center - approximate with font height (adjust if needed)
  const jobNumberY = 300 / 2 + jobNumberMetrics.height / 2;

  // Final SVG
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550">
  <rect width="100%" height="100%" fill="white" />
  <image href="${headerImageDataUri}" x="100" y="20" width="200" height="60" />
   <g transform="translate(50, 100)">
    ${qrSvg}

    <!-- Background white rectangle behind job number -->
    <rect
      x="${jobNumberX - 5}"
      y="${jobNumberY - 25}"
      width="${jobNumberMetrics.width + 10}"
      height="${jobNumberMetrics.height}"
      fill="white"
      rx="3"
      ry="3"
    />

    <!-- Job Number centered inside QR code -->
    <path d="${jobNumberD}" fill="#000" transform="translate(${jobNumberX}, ${jobNumberY})" />
  </g>

  ${jobNamePath}
  ${eventDatePath}
</svg>
`;

  return svg;
}
