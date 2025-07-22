// src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';

export async function POST() {
  const schoologyUserId = cookies().get('schoology_user_id')?.value;

  // Clear the authentication cookie
  cookies().delete('schoology_user_id');
  console.log('Cleared schoology_user_id cookie.');

  // Optional: Remove the access token from the user document in Firestore
  if (schoologyUserId) {
    try {
      const userDocRef = doc(db, 'users', schoologyUserId);
      // Use updateDoc and deleteField to remove specific fields without deleting the user document
      await updateDoc(userDocRef, {
        accessToken: deleteField(),
        accessTokenSecret: deleteField(),
        accessTokenCreatedAt: deleteField(),
      });
      console.log(`Removed access token for user ${schoologyUserId} from Firestore.`);
    } catch (error) {
      console.error('Error removing access token from Firestore during logout:', error);
      // Continue with clearing the cookie even if Firestore update fails
    }
  }

  // Redirect to the home page or login page after logout
  // Use the app's base URL from environment variables for the redirect
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || '/'; // Fallback to root if variable is not set

  // Return a redirect response
   return NextResponse.redirect(appBaseUrl, { status: 307 }); // Use 307 for temporary redirect
}
