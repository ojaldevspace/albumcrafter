"use client";

// import Image from 'next/image';
// import { useEffect, useState } from 'react';

// interface Job {
//   jobId: string;
//   jobNumber: string;
//   jobName: string;
//   jobType: string;
//   photographer: string;
//   location: string;
//   imageUrls: string[];
//   createdAt: string;
// }

// interface LastEvaluatedKey {
//     id: string;
//     createdAt: string;
// }

export default function ViewJobs() {
  // const [jobs, setJobs] = useState<Job[]>([]);
  // const [page, setPage] = useState(1);
  // const [lastEvaluatedKey, setLastEvaluatedKey] = useState<LastEvaluatedKey | null>(null);;
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState('');
  // const [previewJob, setPreviewJob] = useState<Job | null>(null);

  // const fetchJobs = async (startKey = null) => {
  //   setLoading(true);
  //   setError('');

  //   try {
  //     const res = await fetch(`/api/getJobs?page=${page}`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ lastEvaluatedKey: startKey }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok || !Array.isArray(data.jobs)) {
  //       throw new Error(data.error || 'Failed to fetch jobs');
  //     }

  //     setJobs(data.jobs);
  //     setLastEvaluatedKey(data.lastEvaluatedKey || null);
  //   } catch (err: unknown) {
  //       console.error('Fetch error:', err);
      
  //       if (err instanceof Error) {
  //         setError(err.message);
  //       } else {
  //         setError('Something went wrong');
  //       }
      
  //       setJobs([]); // Avoid undefined map error
  //     }
  //   finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchJobs();
  // }, [page]);

  // const handleNext = () => {
  //   if (lastEvaluatedKey) setPage((prev) => prev + 1);
  // };

  // const handlePrev = () => {
  //   if (page > 1) setPage((prev) => prev - 1);
  // };

  return (
    <></>
    // <div className="p-6 max-w-4xl mx-auto">
    //   <h1 className="text-2xl font-bold mb-4">View Jobs</h1>

    //   {loading ? (
    //     <p>Loading...</p>
    //   ) : error ? (
    //     <p className="text-red-500">{error}</p>
    //   ) : (
    //     <>
    //       {jobs.length === 0 ? (
    //         <p>No jobs found.</p>
    //       ) : (
    //         <>
    //           {jobs.map((job) => (
    //             <div key={job.jobId} className="border p-4 rounded mb-4">
    //               <h3 className="font-semibold">
    //                 {job.jobName} ({job.jobNumber})
    //               </h3>
    //               <p>Type: {job.jobType}</p>
    //               <p>Photographer: {job.photographer}</p>
    //               <p>Location: {job.location}</p>
    //               <p>Created At: {new Date(job.createdAt).toLocaleString()}</p>
    //               <button
    //                 onClick={() => setPreviewJob(job)}
    //                 className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
    //               >
    //                 Preview
    //               </button>
    //             </div>
    //           ))}

    //           <div className="flex justify-between mt-4">
    //             <button
    //               onClick={handlePrev}
    //               disabled={page === 1}
    //               className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
    //             >
    //               Previous
    //             </button>
    //             <button
    //               onClick={handleNext}
    //               disabled={!lastEvaluatedKey}
    //               className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
    //             >
    //               Next
    //             </button>
    //           </div>
    //         </>
    //       )}
    //     </>
    //   )}

    //   {/* Modal Preview */}
    //   {previewJob && (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    //       <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
    //         <h2 className="text-lg font-bold mb-2">Image Preview</h2>
    //         <div className="overflow-x-scroll flex space-x-4 mb-4">
    //           {previewJob.imageUrls.map((url, index) => (
    //             <Image
    //               key={index}
    //               src={url}
    //               alt={`Preview ${index}`}
    //               className="w-40 h-40 object-cover rounded"
    //             />
    //           ))}
    //         </div>
    //         <button
    //           className="absolute top-2 right-2 text-gray-700 text-xl"
    //           onClick={() => setPreviewJob(null)}
    //         >
    //           ✖
    //         </button>
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
}
