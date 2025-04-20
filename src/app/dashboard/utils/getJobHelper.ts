// lib/getJobs.ts
export async function getJobs() {
    const res = await fetch('/api/getJobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!res.ok) {
      throw new Error('Failed to fetch jobs');
    }
  
    return res.json();
  }
  