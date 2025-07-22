// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  // The URL will point to our new Firebase Function.
  // We'll replace this with a dynamic value later.
  const schoologyAuthUrl = '/requestToken'; 

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      gap: '20px'
    }}>
      <h1>Schoology Enhancer</h1>
      <p>A better way to manage your school life.</p>
      
      <Link 
        href={schoologyAuthUrl} 
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          fontSize: '1.2em',
          fontWeight: 'bold',
        }}
      >
        Login with Schoology
      </Link>
    </div>
  );
}
