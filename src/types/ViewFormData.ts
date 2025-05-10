// types/ViewFormData.ts

export interface ViewFormData {
    id: string;
    jobNumber: string;
    jobName: string;
    jobType: string;
    photographer: string;
    location: string;
    dealerName: string;
    dealerMobileNumber: string;
    eventDate: Date | null;
    createdAt: string;
    imageUrls: string[];
    flipbookUrl: string;
    qrCodeUrl: string;
  }
  