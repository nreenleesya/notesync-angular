// pages/index.js
import Head from 'next/head';
import SignupButton from '../components/SignupButton';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Head>
        <title>Notesyncs - Supercharge your studies</title>
      </Head>

      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold mb-6">Welcome to Notesyncs</h1>
        <p className="text-xl mb-8">
          This is your home, the starting point to discover the best study material.
        </p>
        
        <h2 className="text-2xl font-semibold mb-6">Supercharge your studies!</h2>
        <p className="mb-8">
          Unlock exclusive features and stay ahead.
        </p>
        
        <SignupButton />
        
        {/* Placeholder for illustration */}
        <div className="mt-12">
          <div className="bg-gray-200 h-64 w-full rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Illustration</span>
          </div>
        </div>
      </div>
    </div>
  );
}