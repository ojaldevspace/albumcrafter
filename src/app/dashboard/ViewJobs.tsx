'use client';

import { useEffect, useState } from 'react';
import { getJobs } from './utils/getJobHelper';
import { ViewFormData } from '@/types/ViewFormData';

export default function ViewJobs() {
    const [jobs, setJobs] = useState<ViewFormData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleViewFlipbook = (key: string) => {
        const url = `/api/flipbook?key=${encodeURIComponent(key)}`;
        window.open(url, '_blank');
    };

    const handleDownloadQr = async (s3Key: string, jobNumber: string) => {
        const response = await fetch('/api/getQrDownloadLink', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key: s3Key, // e.g. "qr-codes/flipbook-123.png"
                filename: `qrcode.png`,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            const link = document.createElement('a');
            link.href = data.url;
            link.download = `flipbook-${jobNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Failed to download QR code');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Uploaded Jobs</h2>
            {loading ? (
                <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
                <p>No jobs found.</p>
            ) : (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Job Number</th>
                                <th scope="col" className="px-6 py-3">Job Name</th>
                                <th scope="col" className="px-6 py-3">Job Type</th>
                                <th scope="col" className="px-6 py-3">Dealer Name</th>
                                <th scope="col" className="px-6 py-3">Phone Number</th>
                                <th scope="col" className="px-6 py-3">Photographer</th>
                                <th scope="col" className="px-6 py-3">Event Date</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">QR Code</th>
                                <th scope="col" className="px-6 py-3">Flipbook</th>
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
                                    <td className="px-6 py-4">{job.jobType}</td>
                                    <td className="px-6 py-4">{job.dealerName}</td>
                                    <td className="px-6 py-4">{job.dealerMobileNumber}</td>
                                    <td className="px-6 py-4">{job.photographer}</td>
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
                                                        src="/qrcode.png"
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
                                        {job.flipbookUrl ? (
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleViewFlipbook(job.flipbookUrl)}
                                                    className="hover:scale-110 transition-transform"
                                                >
                                                    <img
                                                        src="/book.png"
                                                        alt="View Flipbook"
                                                        className="w-6 h-6"
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
