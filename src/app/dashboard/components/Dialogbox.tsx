'use client';

import React, { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Lottie from 'lottie-react';
import { DialogTitle, DialogPanel } from '@headlessui/react';

interface DialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    isUploading: boolean;
    success: string | null;
    error: string | null;
    loadingAnim: object;  // Lottie animation data for loading
    successUpload: object;  // Lottie animation data for success
    progress?: number;
    resetProgress?: () => void;
    autoClose?: boolean;
}

export default function CustomDialog({
    isDialogOpen,
    setIsDialogOpen,
    isUploading,
    success,
    error,
    loadingAnim,
    successUpload,
    progress,
    resetProgress,
    autoClose
}: DialogProps) {

    useEffect(() => {
        if (autoClose && success) {
            const timer = setTimeout(() => {
                if (resetProgress) {
                    resetProgress();
                }
                setIsDialogOpen(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [autoClose, success, setIsDialogOpen]);

    const closeDialog = () => {
        setIsDialogOpen(false);
        if (resetProgress) {
            resetProgress();
        }
    }

    return (
        <Transition appear show={isDialogOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeDialog}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {isUploading && (
                                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Creating album...
                                    </DialogTitle>
                                )}

                                <div className="mt-6 flex flex-col items-center">
                                    {isUploading ? (
                                        <>
                                            <Lottie animationData={loadingAnim} loop className="w-32 h-32" />
                                            <p className="mt-4 text-sm text-gray-600">Uploading your images and saving metadata. Please wait.</p>
                                            {typeof progress === 'number' && (
                                                <div className="w-full mt-4">
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.round(progress * 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                                        {Math.round(progress * 100)}% completed
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : success ? (
                                        <>
                                            <Lottie animationData={successUpload} loop className="w-32 h-32" />
                                            <p className="mt-4 text-green-600">{success}</p>
                                            {!autoClose && <button
                                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                                onClick={closeDialog}
                                            >
                                                Close
                                            </button>}
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-red-600">{error}</p>
                                            <button
                                                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                                onClick={closeDialog}
                                            >
                                                Close
                                            </button>
                                        </>
                                    )}
                                </div>
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
