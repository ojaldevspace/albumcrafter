import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import QRCode from 'qrcode';

registerFont(path.resolve(process.cwd(), 'assets/fonts/times.ttf'), { family: 'Times New Roman' });
registerFont(path.resolve(process.cwd(), 'assets/fonts/RobotoSlab-ExtraBold.ttf'), { family: 'Roboto-ExtraBold' });


export async function generateStyledQRCode(flipbookUrl: string, jobName: string, eventDate: string, jobNumber: string): Promise<string> {
  const qrCodeDataUrl = await QRCode.toDataURL(flipbookUrl, {
    margin: 1,
    width: 300,
    color: {
      dark: '#000000', 
      light: '#ffffff',
    }
  });

  const qrImage = await loadImage(qrCodeDataUrl);

  const headerImagePath = path.resolve(process.cwd(), 'public/assets/images/scanGoogle.jpeg');
  const headerImage = await loadImage(headerImagePath);


  const canvas = createCanvas(400, 550); // Make room for header/footer
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw header text
  const headerWidth = 200;
  const headerHeight = 60;
  ctx.drawImage(headerImage, (canvas.width - headerWidth) / 2, 30, headerWidth, headerHeight);


  // Draw QR code image
  ctx.drawImage(qrImage, 50, 90, 300, 300);

  // Draw footer text
  ctx.fillStyle = '#666666';
  ctx.font = 'bold 20px Times New Roman';
  ctx.textAlign = 'center';
  ctx.fillText(`B-${jobNumber}`, canvas.width / 2, 420);
  ctx.fillText(jobName, canvas.width / 2, 450);
  ctx.fillText(eventDate, canvas.width / 2, 480)

  // Convert final canvas to DataURL
  return canvas.toDataURL('image/png');
}