import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-8xl font-bold text-primary-600 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link to="/dashboard" className="btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
