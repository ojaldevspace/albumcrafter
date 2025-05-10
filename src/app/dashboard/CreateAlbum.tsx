'use client';
import { useState } from 'react';
import loadingAnim from '../../../public/assets/animation/UploadingAnimation.json';
import successUpload from '../../../public/assets/animation/SuccessfullyCompleted.json';
import CustomDatePicker from './components/DatePicker';
import InputColumn from './components/InputColumn';
import ImageUpload from './components/ImageUpload';
import CustomDialog from './components/Dialogbox';
import CustomDropdown from './components/CustomDropdown';
import { AlbumFormData } from '@/types/AlbumFormData';
import { uploadAlbum } from './utils/uploadHelper';
import { JobType } from '@/types/JobTypeOption';

const initialFormState: AlbumFormData = {
    jobNumber: '',
    jobName: '',
    jobType: '',
    photographer: '',
    location: '',
    dealerName: '',
    dealerMobileNumber: '',
    eventDate: null,
    selectedFiles: [],
};

export default function CreateAlbum() {
    const [formData, setFormData] = useState<AlbumFormData>(initialFormState);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

    const jobTypes = Object.values(JobType);

    const handleChange = (key: keyof AlbumFormData, value: string | File[] | Date | null) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const removeFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
    };

    const handleFilesSelected = async (files: File[]) => {
        setSelectedFiles(files);
    };

    const validateForm = () => {
        const requiredFields: (keyof AlbumFormData)[] = [
            'jobNumber',
            'jobName',
            'jobType',
            'photographer',
            'location',
            'dealerName',
            'dealerMobileNumber',
            'eventDate',
        ];

        const newErrors: Record<string, boolean> = {};
        let hasError = false;

        requiredFields.forEach(field => {
            const value = formData[field];
            if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
                newErrors[field] = true;
                hasError = true;
            } else {
                newErrors[field] = false;
            }
        });

        if (selectedFiles.length === 0) {
            setError('Please select at least one image to upload');
            setIsDialogOpen(false);
            setIsUploading(false);
            return 'Missing images';
        }

        setFieldErrors(newErrors);
        return hasError ? 'Please fill all required fields' : null;
    };


    const handleUpload = async () => {
        setError('');
        setSuccess('');
        setIsUploading(true);
        setIsDialogOpen(true);


        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setIsUploading(false);
            setIsDialogOpen(false);
            return;
        }

        try {
            const result = await uploadAlbum(formData, selectedFiles);
            if (result.success) {
                setSuccess('Album created successfully');
                setFormData(initialFormState);
                setSelectedFiles([]);
            } else {
                setError(result.error || "Failed to create flipbook");
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Something went wrong during upload');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow border space-y-6">
            <h2 className="text-2xl font-semibold">Create Album</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputColumn label='Job Number' value={formData.jobNumber} onChange={val => handleChange('jobNumber', val)} isError={fieldErrors.jobNumber} />
                </div>
                <div>
                    <InputColumn label='Job Name' value={formData.jobName} onChange={val => handleChange('jobName', val)} isError={fieldErrors.jobName} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <CustomDropdown label="Job Type" options={jobTypes} value={formData.jobType} onChange={val => handleChange('jobType', val)} isError={fieldErrors.jobType} />
                </div>
                <div>
                    <CustomDatePicker label='Date' selectedDate={formData.eventDate} onChange={val => handleChange('eventDate', val)} isError={fieldErrors.eventDate} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputColumn label='Dealer & Agent Name' value={formData.dealerName} onChange={val => handleChange('dealerName', val)} isError={fieldErrors.dealerName} />
                </div>
                <div>
                    <InputColumn label='Phone Number' value={formData.dealerMobileNumber} onChange={val => handleChange('dealerMobileNumber', val)} isError={fieldErrors.dealerMobileNumber} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputColumn label='Photographer Name' value={formData.photographer} onChange={val => handleChange('photographer', val)} isError={fieldErrors.photographer} />
                </div>
                <div>
                    <InputColumn label='Location' value={formData.location} onChange={val => handleChange('location', val)} isError={fieldErrors.location} />
                </div>
            </div>
            <div>
                <ImageUpload
                    selectedFiles={selectedFiles}
                    onFilesSelected={handleFilesSelected}
                    onFileRemove={removeFile}
                />
            </div>
            <div>
                <button
                    onClick={handleUpload}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                    disabled={isUploading}
                >
                    Upload
                </button>
            </div>
            <CustomDialog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                isUploading={isUploading}
                success={success}
                error={error}
                loadingAnim={loadingAnim}
                successUpload={successUpload}
            />
        </div>
    );
}
