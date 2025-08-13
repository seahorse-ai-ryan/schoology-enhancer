'use client';

import { useEffect, useState } from 'react';

export default function SimpleTestPage() {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Call the Cloud Function directly
    fetch('http://127.0.0.1:5001/schoology-testing/us-central1/simpletest')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Simple Test API</h1>
      <p>{message}</p>
    </div>
  );
} 