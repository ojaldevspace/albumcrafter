'use client';

import { useEffect, useState } from 'react';
import { getJobs } from './utils/getJobHelper';
import { ViewFormData } from '@/types/ViewFormData';
import CustomDatePicker from './components/DatePicker';
import DownloadButton from './components/DownloadButton';
import DeleteConfirmationBox from './components/DeleteConfirmationBox';

const today = new Date();
today.setHours(0, 0, 0, 0);

export default function ViewJobs() {
    const [jobs, setJobs] = useState<ViewFormData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(today);
    const [downloading, setDownloading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const data = await getJobs(selectedDate.toISOString());
                setJobs(data);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [selectedDate]);

    const handleDownloadQr = async (s3Key: string, jobName: string) => {
        const response = await fetch('/api/getQrDownloadLink', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key: s3Key, // e.g. "qr-codes/flipbook-123.png"
                filename: `${jobName}.png`,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            const link = document.createElement('a');
            link.href = data.url;
            link.download = `flipbook-${jobName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Failed to download QR code');
        }
    };

    const handleDownloadAllQRCodes = async () => {
        setDownloading(true);
        try {
            const response = await fetch('/api/downloadAllQRCodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobs: jobs.map(job => ({
                        key: job.qrCodeUrl,     // This should be your S3 key
                        filename: `${job.jobNumber}.png`,
                    })),
                }),
            });

            const data = await response.json();
            if (response.ok && data.url) {
                const link = document.createElement('a');
                link.href = data.url;
                link.download = 'all-qrcodes.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('Failed to download QR codes');
            }
        }
        catch {
            alert('Failed to download QR codes');
        }
        finally {
            setDownloading(false);
        }

    };

    //     const handleDownloadAllQRCodes = async () => {
    //   setDownloading(true);
    //   try {
    //     const baseUrl = window.location.origin;
    //     const qrdetails = mapToQrPageInfo(jobs);

    //     const response = await fetch('/api/downloadAllQRCodes', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({ jobs : qrdetails }),
    //     });

    //     if (response.ok) {
    //       const blob = await response.blob();
    //       const url = window.URL.createObjectURL(blob);
    //       const link = document.createElement('a');
    //       link.href = url;
    //       link.download = 'qrcodes.pdf';
    //       document.body.appendChild(link);
    //       link.click();
    //       document.body.removeChild(link);
    //     } else {
    //       alert('Failed to generate or download QR codes');
    //     }
    //   } catch (err) {
    //     alert('Error downloading QR codes');
    //   } finally {
    //     setDownloading(false);
    //   }
    // };

    const handleDateChange = (date: Date | null) => {
        if (date == null) {
            const resetToday = new Date();
            resetToday.setHours(0, 0, 0, 0); // reset to midnight
            setSelectedDate(resetToday);
            return;
        }

        const resetDate = new Date(date);
        resetDate.setHours(0, 0, 0, 0); // force 12:00 AM
        setSelectedDate(resetDate);
    };

    const handleDeleteClick = (jobId: string) => {
        setJobToDelete(jobId);
        setShowModal(true);
    };

    const confirmDeleteAlbum = async () => {
        if (!jobToDelete) return;

        try {
            const res = await fetch('/api/deleteAlbum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: jobToDelete }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to delete album');
            }

            // Remove the deleted job from state
            setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete album');
        }
        finally {
            setJobToDelete(null);
        }
    };

    return (
        <div className="p-6">
            <div className="relative">
                <div className="flex flex-row flex-wrap items-center justify-between pb-4">
                    <CustomDatePicker
                        selectedDate={selectedDate}
                        onChange={handleDateChange}
                        required={false}
                    />
                    <DownloadButton
                        downloading={downloading}
                        onClick={handleDownloadAllQRCodes}
                        label='Download QR'
                    />
                </div>
            </div>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="shadow-md sm:rounded flex flex-col items-center justify-center text-center text-gray-600 px-4">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-semibold mb-2">No Jobs Found</h2>
                </div>
            ) : (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Job Number</th>
                                <th scope="col" className="px-6 py-3">Job Name</th>
                                <th scope="col" className="px-6 py-3">Dealer Name</th>
                                <th scope="col" className="px-6 py-3">Phone Number</th>
                                <th scope="col" className="px-6 py-3">Event Date</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">QR Code</th>
                                <th scope="col" className="px-6 py-3">Flipbook</th>
                                <th scope="col" className="px-6 py-3">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th
                                        scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                    >
                                        {job.jobNumber}
                                    </th>
                                    <td className="px-6 py-4">{job.jobName}</td>
                                    <td className="px-6 py-4">{job.dealerName}</td>
                                    <td className="px-6 py-4">{job.dealerMobileNumber}</td>
                                    <td className="px-6 py-4">
                                        {job.eventDate
                                            ? new Date(job.eventDate).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4">{job.location}</td>
                                    <td className="px-6 py-4">
                                        {job.qrCodeUrl ? (
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleDownloadQr(job.qrCodeUrl, job.jobNumber)}
                                                    className="hover:scale-110 transition-transform"
                                                >
                                                    <img
                                                        src="/assets/images/qrcode.png"
                                                        alt="Download QR"
                                                        className="w-6 h-6"
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {job.id ? (
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => window.open(`/flipbook/view?jobId=${job.id}`, '_blank')}
                                                    className="hover:scale-110 transition-transform"
                                                >
                                                    <img
                                                        src="/assets/images/book.png"
                                                        alt="View Flipbook"
                                                        className="w-6 h-6"
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleDeleteClick(job.id)}
                                                className="hover:scale-110 transition-transform"
                                            >
                                                <img
                                                    src="/assets/images/delete_red.svg"
                                                    alt="Delete"
                                                    className="w-6 h-6"
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <DeleteConfirmationBox
                open={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmDeleteAlbum}
            />
        </div>
    );
}

