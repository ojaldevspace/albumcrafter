'use client';
import { Fragment, useState } from 'react';
import imageCompression from 'browser-image-compression';
import loadingAnim from '../../../public/UploadingAnimation.json';
import successUpload from '../../../public/SuccessfullyCompleted.json'
import CustomDatePicker from './components/DatePicker';
import InputColumn from './components/InputColumn';
import ImageUpload from './components/ImageUpload';
import CustomDialog from './components/Dialogbox';
import CustomDropdown from './components/CustomDropdown';


export default function CreateAlbum() {
    const [jobNumber, setJobNumber] = useState('');
    const [jobName, setJobName] = useState('');
    const [jobType, setJobType] = useState('');
    const [photographer, setPhotographer] = useState('');
    const [location, setLocation] = useState('');
    const [dealerName, setDealerName] = useState('');
    const [dealerMobileNumber, setDealerMobileNumber] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles([...selectedFiles, ...Array.from(event.target.files)]);
        }
    };

    const options = ['Wedding', 'Birthday', 'Engagement', 'Reception', 'df', 'arfd', 'arfe', 'arfds'];

    const removeFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
    };

    const compressImageOld = async (file: File) => {
        const options = {
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            initialQuality: 0.5
        };
        return await imageCompression(file, options);
    };

    const handleUpload = async () => {
        setError('');
        setSuccess('');
        setIsUploading(true);

        setIsDialogOpen(true);

        if (selectedFiles.length === 0) {
            setError('Please select files to upload');
            setIsUploading(false);
            setIsDialogOpen(false);
            return;
        }

        try {
            const formData = new FormData();

            for (const file of selectedFiles) {
                const compressed = await compressImageOld(file);
                formData.append('file', compressed, file.name); // preserve original name
            }

            const createdAt = selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]; // "2025-04-09"
            formData.append('jobNumber', jobNumber);
            formData.append('uploadDate', createdAt);


            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result.error || 'Image upload failed');
                setIsUploading(false);
                setIsDialogOpen(false);
                return;
            }

            const imageUrls = result.files;
            setUploadedFiles(imageUrls);
            setSelectedFiles([]);

            // Save metadata + image URLs to DynamoDB
            const metadataResponse = await fetch('/api/createAlbum', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobNumber,
                    jobName,
                    jobType,
                    photographer,
                    location,
                    imageUrls,
                    createdAt,
                    dealerName,
                    dealerMobileNumber,
                }),
            });

            const metadataResult = await metadataResponse.json();
            if (metadataResponse.ok) {
                setSuccess('Album created successfully');
            } else {
                setError(metadataResult.error || 'Failed to save album data');
            }
            setJobNumber('');
            setPhotographer('');
            setJobName('');
            setSelectedFiles([]);
            setJobType('');
            setLocation('');
            setDealerName('');
            setDealerMobileNumber('');
            setSelectedDate(null)
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

            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputColumn label='Job Number' value={jobNumber} onChange={setJobNumber} />
                </div>
                <div>
                    <InputColumn label='Job Name' value={jobName} onChange={setJobName} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <CustomDropdown label="Job Type" options={options} value={jobType} onChange={setJobType} />
                </div>
                <div>
                    <CustomDatePicker label='Date' selectedDate={selectedDate} onChange={setSelectedDate} />
                </div>
            </div>

            {/* Dealer & Agent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputColumn label='Dealer & Agent Name' value={dealerName} onChange={setDealerName} />
                </div>

                <div>
                    <InputColumn label='Phone Number' value={dealerMobileNumber} onChange={setDealerMobileNumber} />
                </div>
            </div>
            {/* Photographer and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputColumn label='Photographer Name' value={photographer} onChange={setPhotographer} />
                </div>

                <div>
                    <InputColumn label='Location' value={location} onChange={setLocation} />
                </div>
            </div>
            {/* File Upload */}
            <div>
                <ImageUpload
                    selectedFiles={selectedFiles}
                    onFilesSelected={setSelectedFiles}
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
