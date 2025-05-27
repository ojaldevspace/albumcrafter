'use client';

import imageCompression from 'browser-image-compression';
import React, { useEffect, useState } from 'react';
import CustomDialog from './Dialogbox';
import loadingAnim from '@/../public/assets/animation/UploadingAnimation.json';
import successUpload from '@/../public/assets/animation/SuccessfullyCompleted.json';

interface ImageUploadProps {
    label?: string;
    selectedFiles: File[];
    onFilesSelected: (files: File[]) => void;
    onFileRemove: (index: number) => void;
}

export default function ImageUpload({
    label = 'Album Images',
    selectedFiles,
    onFilesSelected,
    onFileRemove,
}: ImageUploadProps) {
    const [progress, setProgress] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [showProgressDialog, setShowProgressDialog] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    useEffect(() => {
        const newPreviews: string[] = [];

        const currentMap = new Map<string, string>();
        selectedFiles.forEach((file, index) => {
            currentMap.set(file.name + file.lastModified, previews[index] || '');
        });

        selectedFiles.forEach((file) => {
            const key = file.name + file.lastModified;
            if (currentMap.has(key) && currentMap.get(key)) {
                newPreviews.push(currentMap.get(key)!);
            } else {
                const url = URL.createObjectURL(file);
                newPreviews.push(url);
            }
        });

        // Revoke old unused URLs
        previews.forEach((url) => {
            if (!newPreviews.includes(url)) {
                URL.revokeObjectURL(url);
            }
        });

        setPreviews(newPreviews);
    }, [selectedFiles]);

    const resetProgress = () => {
        setProgress(0);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        compressAndUploadFiles(files);
    };

    const handleDroppedFiles = (files: FileList) => {
        const fileArray = Array.from(files);
        compressAndUploadFiles(fileArray);
    };

    const compressAndUploadFiles = async (filesArray: File[]) => {
        setIsUploading(true);
        setTotal(filesArray.length);
        setProgress(0);
        setShowProgressDialog(true);

        const compressedFiles: File[] = [];
        try {
            for (let i = 0; i < filesArray.length; i++) {
                const file = filesArray[i];
                const options = {
                    maxWidthOrHeight: 2400,
                    useWebWorker: true,
                    initialQuality: 0.6,
                };

                const compressedBlob = await imageCompression(file, options);
                const compressedFile = new File([compressedBlob], file.name, {
                    type: compressedBlob.type,
                });

                compressedFiles.push(compressedFile);
                setProgress((prev) => prev + 1);
            }
            onFilesSelected([...selectedFiles, ...compressedFiles]);
            setSuccess('Album uploaded successfully');
        } catch {
            setError('Failed to upload album');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleDroppedFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div
                className={`mt-1 px-6 pt-5 pb-6 border-2 ${
                    isDragOver ? 'border-indigo-500' : 'border-gray-300'
                } border-dashed rounded-md transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {selectedFiles.length === 0 ? (
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H20V20H8V28H20V40H28V28H40V20H28V8Z"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="text-sm text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                <span>Upload a file</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="sr-only"
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pr-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={previews[index]}
                                        alt={file.name}
                                        className="w-full h-24 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onFileRemove(index)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-white text-black rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <CustomDialog
                isDialogOpen={showProgressDialog}
                setIsDialogOpen={setShowProgressDialog}
                isUploading={isUploading}
                success={success}
                error={error}
                loadingAnim={loadingAnim}
                successUpload={successUpload}
                progress={progress / total}
                resetProgress={resetProgress}
                autoClose={true}
            />
        </div>
    );
}
