import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link 
        href="/projects/create"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Project
      </Link>
    </nav>
  );
} 