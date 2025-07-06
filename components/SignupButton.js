// components/SignupButton.js
import { useState } from 'react';
import Link from 'next/link';

export default function SignupButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
      >
        Create an account now
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Your Account</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full p-2 border rounded"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Sign Up
              </button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account? <Link href="/login" className="text-blue-600">Log in</Link>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}