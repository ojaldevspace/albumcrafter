import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';

export async function generateStyledQRCode(flipbookUrl: string, jobName: string, eventDate: string): Promise<string> {
  const qrCodeDataUrl = await QRCode.toDataURL(flipbookUrl, {
    margin: 1,
    width: 300,
    color: {
      dark: '#000000', 
      light: '#ffffff',
    }
  });

  const qrImage = await loadImage(qrCodeDataUrl);

  const canvas = createCanvas(400, 500); // Make room for header/footer
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw header text
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan to View Album', canvas.width / 2, 40);

  // Draw QR code image
  ctx.drawImage(qrImage, 50, 70, 300, 300);

  // Draw footer text
  ctx.fillStyle = '#666666';
  ctx.font = '18px sans-serif';
  ctx.fillText(jobName, canvas.width / 2, 430);
  ctx.fillText(eventDate, canvas.width/2, 460);

  // Convert final canvas to DataURL
  return canvas.toDataURL('image/png');
}
