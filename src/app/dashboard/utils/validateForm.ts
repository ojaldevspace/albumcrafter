import { AlbumFormData } from "@/types/AlbumFormData";

export function validateForm(formData: AlbumFormData, selectedFiles: File[]): string | null {
    const requiredFields = [
      'jobNumber',
      'jobName',
      'jobType',
      'photographer',
      'location',
      'dealerName',
      'dealerMobileNumber',
      'eventDate',
    ];
  
    for (const field of requiredFields) {
      const value = formData[field as keyof AlbumFormData];
      if (
        value === '' ||
        value === null ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return `Please fill in the ${field.replace(/([A-Z])/g, ' $1')}`;
      }
    }
  
    if (selectedFiles.length === 0) {
      return 'Please select at least one image to upload';
    }
  
    return null;
  };
  