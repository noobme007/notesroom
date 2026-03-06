'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiBookOpen, FiUsers, FiMessageSquare, FiLogIn } from 'react-icons/fi';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();

  // If already authenticated, redirect to dashboard
  if (user && typeof window !== 'undefined') {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBookOpen className="w-7 h-7 text-primary-400" />
            <span className="text-xl font-bold text-white">
              StudyRoom<span className="text-primary-400"> AI</span>
            </span>
          </div>
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <FiLogIn className="w-4 h-4" />
            {loading ? 'Loading...' : 'Sign in with Google'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Study smarter,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">
              together.
            </span>
          </h1>
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Create rooms, share notes, preview files, and chat with an AI that knows
            your study material inside out.
          </p>
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="bg-white text-dark-900 font-bold py-3 px-8 rounded-xl text-lg hover:bg-dark-100 transition-colors shadow-lg shadow-white/10"
          >
            Get Started — It&apos;s Free
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FiUsers className="w-8 h-8" />}
            title="Collaborative Rooms"
            description="Create study rooms, invite friends with a code, and organize notes with folders and role-based permissions."
          />
          <FeatureCard
            icon={<FiBookOpen className="w-8 h-8" />}
            title="File Preview & Storage"
            description="Upload PDFs, docs, images, and slides. Preview files directly in your browser without downloading."
          />
          <FeatureCard
            icon={<FiMessageSquare className="w-8 h-8" />}
            title="AI-Powered Chat"
            description="Ask questions about your notes. Our AI reads your documents and gives you relevant, accurate answers."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Sign In', desc: 'Use your Google account' },
            { step: '2', title: 'Create Room', desc: 'Get a unique room code' },
            { step: '3', title: 'Upload Notes', desc: 'Organize files in folders' },
            { step: '4', title: 'Ask AI', desc: 'Get answers from your notes' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600/20 text-primary-400 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="text-white font-semibold mb-1">{item.title}</h3>
              <p className="text-dark-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-dark-500 text-sm">
          <p>&copy; {new Date().getFullYear()} StudyRoom AI. Built for learners.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card hover:border-primary-500/30 transition-all group">
      <div className="text-primary-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
