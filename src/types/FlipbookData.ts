// types/ViewFormData.ts

export interface FlipBookData {
    id: string;
    jobNumber: string;
    jobName: string;
    jobType: string;
    photographer: string;
    location: string;
    music: string;
    dealerName: string;
    dealerMobileNumber: string;
    eventDate: Date | null;
    eventDateFriendly: string;
    createdAt: string;
    imageUrls: string[];
    numPages: number;
    frontCoverUrl: string;
    backCoverUrl: string;
    aspectRatio: number;
    isCropped: boolean;
  }
  