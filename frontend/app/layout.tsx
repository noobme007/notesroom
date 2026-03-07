import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyRoom AI — Collaborative Notes Platform',
  description:
    'A collaborative notes sharing platform where users join rooms, access organized notes, preview files, and interact with an AI chatbot.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'premium-toast',
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                color: '#f1f5f9',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                padding: '12px 20px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
