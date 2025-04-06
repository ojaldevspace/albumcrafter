'use client';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function CreateAlbum() {
  const [jobNumber, setJobNumber] = useState('');
  const [jobName, setJobName] = useState('');
  const [jobType, setJobType] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles([...selectedFiles, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const compressImage = async (file: File) => {
    const options = {
      useWebWorker: true,
      initialQuality: 0.1
    };
    return await imageCompression(file, options);
  };

  const handleUpload = async () => {
    setError('');
    setSuccess('');

    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    try {
      const formData = new FormData();

      for (const file of selectedFiles) {
        const compressed = await compressImage(file);
        formData.append('file', compressed, file.name); // preserve original name
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Image upload failed');
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
        }),
      });

      const metadataResult = await metadataResponse.json();
      if (metadataResponse.ok) {
        setSuccess('Album created successfully');
      } else {
        setError(metadataResult.error || 'Failed to save album data');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Something went wrong during upload');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Album</h2>

      <input type="text" placeholder="Job Number" value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} className="mb-2 border p-2 w-full" />
      <input type="text" placeholder="Job Name" value={jobName} onChange={(e) => setJobName(e.target.value)} className="mb-2 border p-2 w-full" />

      <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="mb-2 border p-2 w-full">
        <option value="">Select Job Type</option>
        <option value="Wedding">Wedding</option>
        <option value="Portrait">Portrait</option>
        <option value="Event">Event</option>
      </select>

      <input type="text" placeholder="Photographer Name" value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="mb-2 border p-2 w-full" />
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="mb-2 border p-2 w-full" />

      <input type="file" multiple onChange={handleFileChange} className="mb-2 border p-2 w-full" />

      {selectedFiles.length > 0 && (
        <ul className="mb-2">
          {selectedFiles.map((file, index) => (
            <li key={index} className="text-sm flex justify-between items-center">
              {file.name}
              <button onClick={() => removeFile(index)} className="text-red-500 text-sm ml-2">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Upload
      </button>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold">Uploaded Files:</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index} className="text-sm">{file}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}
