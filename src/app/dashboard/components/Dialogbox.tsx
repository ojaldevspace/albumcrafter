'use client';

import React, { Fragment } from 'react';
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
}

export default function CustomDialog({
  isDialogOpen,
  setIsDialogOpen,
  isUploading,
  success,
  error,
  loadingAnim,
  successUpload,
}: DialogProps) {
  return (
    <Transition appear show={isDialogOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsDialogOpen(false)}>
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
                    </>
                  ) : success ? (
                    <>
                      <Lottie animationData={successUpload} loop className="w-32 h-32" />
                      <p className="mt-4 text-green-600">{success}</p>
                      <button
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-red-600">{error}</p>
                      <button
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => setIsDialogOpen(false)}
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
