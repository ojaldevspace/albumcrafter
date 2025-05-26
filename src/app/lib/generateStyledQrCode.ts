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

  // Utility to get centered path
  const generateCenteredPath = (text: string, y: number) => {
    const metrics = textToSVG.getMetrics(text, { fontSize });
    const x = (400 - metrics.width) / 2;
    const d = textToSVG.getD(text, {
      x: 0,
      y: 0,
      fontSize,
      attributes: { fill: '#666' },
    });
    return `<path d="${d}" transform="translate(${x}, ${y})" />`;
  };

  const jobNumberPath = generateCenteredPath(`B-${jobNumber}`, 440);
  const jobNamePath = generateCenteredPath(jobName, 470);
  const eventDatePath = generateCenteredPath(eventDate, 500);

  // Final SVG
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550">
  <rect width="100%" height="100%" fill="white" />
  <image href="${headerImageDataUri}" x="100" y="20" width="200" height="60" />
  <g transform="translate(50, 100)">
    ${qrSvg}
  </g>
  ${jobNumberPath}
  ${jobNamePath}
  ${eventDatePath}
</svg>
`;

  return svg;
}
