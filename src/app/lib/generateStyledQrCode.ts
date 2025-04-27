import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';

function formatDateToCustomString(isoDateString: string): string {
    const date = new Date(isoDateString);
  
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const year = date.getFullYear();
  
    return `${dayName} ${day}/${month}/${year}`;
  }
  

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
  ctx.fillText(jobName, canvas.width / 2, 450);

  // Convert final canvas to DataURL
  return canvas.toDataURL('image/png');
}
