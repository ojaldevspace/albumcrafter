// lib/getJobs.ts
export async function getJobs(createdAt: string) {
    const res = await fetch('/api/getJobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ createdAt }),
    });
  
    if (!res.ok) {
      throw new Error('Failed to fetch jobs');
    }
  
    return res.json();
  }