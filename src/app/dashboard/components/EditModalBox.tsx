import { ViewFormData } from '@/types/ViewFormData';
import { useState } from 'react';
import InputColumn from './InputColumn';

type Props = {
  job: ViewFormData;
  onClose: () => void;
  onSave: (updatedJob: ViewFormData) => void;
};

export default function EditJobModal({ job, onClose, onSave } : Props) {
    const [formData, setFormData] = useState({ ...job });

    const handleChange = (key: keyof ViewFormData, value: string | File[] | Date | null) => {
        console.log(`Changing ${key} to ${value}`)
            setFormData(prev => ({
                ...prev,
                [key]: value,
            }));
        };

    const handleSubmit = async () => {
        const res = await fetch('/api/updateJob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            onSave(formData);
            onClose();
        } else {
            alert('Failed to update job');
        }
    };

    return (
        <>
        <div className="fixed inset-0 z-10 backdrop-blur-sm" />
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-6">
                <h2 className="text-xl font-semibold mb-4">Editing Job: {formData.jobNumber}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputColumn label='Job Name' value={formData.jobName} onChange={val => handleChange('jobName', val)} />
                    </div>
                    <div>
                        <InputColumn label='Studio Name' value={formData.dealerName} onChange={val => handleChange('dealerName', val)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputColumn label='Phone Number' value={formData.dealerMobileNumber} onChange={val => handleChange('dealerMobileNumber', val)} />
                    </div>
                    <div>
                        <InputColumn label='Location' value={formData.location} onChange={val => handleChange('location', val)} />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className='px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition'>Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Save</button>
                </div>
            </div>
        </div>
        </>
    );
}
