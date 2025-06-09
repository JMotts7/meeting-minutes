
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Meeting Minutes</title>
      </Head>
      <main style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1>🎤 Meeting Minutes</h1>
        <p>Upload your meeting audio and get a clean, AI-powered summary.</p>
        <p>(You are seeing this because the full UI component will be plugged in here next.)</p>
      </main>
    </>
  );
}
