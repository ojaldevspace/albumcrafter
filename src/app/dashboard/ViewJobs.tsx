'use client';

import { useEffect, useState } from 'react';
import { AlbumFormData } from '@/types/AlbumFormData'; // adjust path as needed
import { getJobs } from './utils/getJobHelper';
// replace with your actual API

export default function ViewJobs() {
  const [jobs, setJobs] = useState<AlbumFormData[]>([]);
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
                <th scope="col" className="px-6 py-3">Job Name</th>
                <th scope="col" className="px-6 py-3">Job Type</th>
                <th scope="col" className="px-6 py-3">Photographer</th>
                <th scope="col" className="px-6 py-3">Location</th>
                <th scope="col" className="px-6 py-3">Event Date</th>
                <th scope="col" className="px-6 py-3">Images</th>
                <th scope="col" className="px-6 py-3 text-right">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {job.jobName}
                  </th>
                  <td className="px-6 py-4">{job.jobType}</td>
                  <td className="px-6 py-4">{job.photographer}</td>
                  <td className="px-6 py-4">{job.location}</td>
                  <td className="px-6 py-4">
                    {job.eventDate
                      ? new Date(job.eventDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-6 py-4">{job.selectedFiles?.length ?? 0}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href="#"
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      View
                    </a>
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
