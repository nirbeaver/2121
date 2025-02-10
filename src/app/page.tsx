'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { signInWithGoogle, signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Construction Project Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your construction projects with our comprehensive management solution. 
            Track projects, manage expenses, and generate reports all in one place.
          </p>
          
          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 
                         text-white font-medium rounded-lg transition-colors"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign in with Google
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">Welcome, {user.email}</p>
              <div className="space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 
                           text-white font-medium rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 
                           text-white font-medium rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Project Management"
            description="Track progress, manage resources, and coordinate teams efficiently."
          />
          <FeatureCard 
            title="Financial Tracking"
            description="Monitor expenses, track budgets, and manage office costs seamlessly."
          />
          <FeatureCard 
            title="Reporting"
            description="Generate detailed reports and insights for better decision making."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 bg-white rounded-xl shadow-md"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
