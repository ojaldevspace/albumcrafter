'use client';

import { useEffect, useState } from 'react';
import { getJobs } from './utils/getJobHelper';
import { ViewFormData } from '@/types/ViewFormData';
import FilterDropdown from './components/FilterDropdown';

export default function ViewJobs() {
    const [jobs, setJobs] = useState<ViewFormData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('Last 7 days'); // Default filter


    const getFilteredDate = (filter: string) => {
        const currentDate = new Date();
        let filterDate;

        switch (filter) {
            case 'Today':
                filterDate = new Date();
                filterDate.setDate(currentDate.getDate() - 1);
                break;
            case 'Last 7 days':
                filterDate = new Date();
                filterDate.setDate(currentDate.getDate() - 7);
                break;
            case 'Last 30 days':
                filterDate = new Date();
                filterDate.setDate(currentDate.getDate() - 30);
                break;
            case 'Last month':
                filterDate = new Date();
                filterDate.setMonth(currentDate.getMonth() - 1);
                break;
            case 'Last year':
                filterDate = new Date();
                filterDate.setFullYear(currentDate.getFullYear() - 1);
                break;
            default:
                filterDate = new Date();
        }

        return filterDate.toISOString();
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const filterDate = getFilteredDate(selectedFilter); // Get date based on the selected filter
                const data = await getJobs(filterDate);
                setJobs(data);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [selectedFilter]);

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

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Uploaded Jobs</h2>
            <div className="relative shadow-md sm:rounded-lg">
                <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <FilterDropdown
                        selectedFilter={selectedFilter}
                        handleFilterChange={handleFilterChange}
                    />
                </div>
            </div>
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
                                        {job.id ? (
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => window.open(`/flipbook/view?jobId=${job.id}`, '_blank')}
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
