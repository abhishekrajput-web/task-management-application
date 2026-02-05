import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <FileQuestion className="h-12 w-12 text-slate-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">404</h1>
        <p className="mt-4 text-base font-semibold text-slate-900">Page not found</p>
        <p className="mt-2 text-sm text-slate-600">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          
          <Link
            to="/dashboard"
            className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;