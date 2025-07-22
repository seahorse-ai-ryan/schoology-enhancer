// src/app/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function isAuthenticated() {
  const schoologyUserId = cookies().get('schoology_user_id')?.value;

  if (!schoologyUserId) {
    return false;
  }

  // Optional: Verify the user exists in Firestore and has an access token
  try {
    const userDocRef = doc(db, 'users', schoologyUserId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().accessToken) {
      return true;
    } else {
      // If cookie exists but user data is missing/invalid in Firestore
      console.warn('Authentication cookie present, but user data missing or invalid in Firestore.');
      // You might want to clear the invalid cookie here
      // cookies().delete('schoology_user_id');
      return false;
    }
  } catch (error) {
    console.error('Error checking authentication status from Firestore:', error);
    return false;
  }
}

export default async function HomePage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px'
    }}>
      <h1>Schoology Enhancer</h1>
      <p>You are authenticated!</p>
      {/* Add links to authenticated parts of your app here */}
      <Link href="/dashboard" style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          fontSize: '1.1em'
      }}>
          Go to Dashboard
      </Link>

      {/* Logout Button */}
      <form action="/api/auth/logout" method="post">
        <button type="submit" style={{
           padding: '10px 20px',
           backgroundColor: '#f44336',
           color: 'white',
           borderRadius: '5px',
           border: 'none',
           fontSize: '1.1em',
           cursor: 'pointer',
           marginTop: '20px'
        }}>
          Logout
        </button>
      </form>

    </div>
  );
}
