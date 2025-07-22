// src/app/login/page.tsx

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px'
    }}>
      <h1>Login to Schoology Enhancer</h1>
      <Link href="/api/auth/schoology" style={{
        padding: '10px 20px',
        backgroundColor: '#2196f3',
        color: 'white',
        borderRadius: '5px',
        textDecoration: 'none',
        fontSize: '1.1em'
      }}>

          Login with Schoology

      </Link>
      {/* We will add status indicators here later */}
    </div>
  );
}
