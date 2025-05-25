// types/AlbumFormData.ts

export interface AlbumFormData {
    jobNumber: string;
    jobName: string;
    jobType: string;
    photographer: string;
    location: string;
    dealerName: string;
    dealerMobileNumber: string;
    eventDate: Date | null;
    selectedFiles: File[];
    music: string;
  }
  