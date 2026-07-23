import { useNavigate } from 'react-router-dom';

function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-8xl mb-4">🚫</p>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Access Denied</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        You do not have permission to view this page.
      </p>
      <button onClick={() => navigate(-1)} className="btn-secondary">
        Go Back
      </button>
    </div>
  );
}

export default UnauthorizedPage;
