import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { setupCollections } from '@/lib/firebase/setupCollections';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectProvider } from "@/lib/contexts/ProjectContext";

// Initialize collections when app starts
setupCollections().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <ProjectProvider>
              {children}
            </ProjectProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
