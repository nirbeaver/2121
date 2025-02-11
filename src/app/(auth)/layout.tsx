'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { redirect } from 'next/navigation';
import { 
  MdDashboard, 
  MdAssignment,
  MdBarChart,
  MdAttachMoney,
  MdLogout 
} from 'react-icons/md';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) {
    redirect('/');
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: MdDashboard
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: MdAssignment
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: MdBarChart
    },
    {
      name: 'Finance',
      href: '/finance',
      icon: MdAttachMoney
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center h-16 px-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-800">
                  Construction PM
                </h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                  >
                    <MdLogout className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-64">
          <main className="py-6 px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 