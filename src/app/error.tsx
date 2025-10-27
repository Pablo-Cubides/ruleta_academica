'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development, or send to monitoring service
    console.error('Error boundary caught:', error);
    
    // If Sentry is configured, you could capture here
    // captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="card-primary max-w-2xl mx-4 text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="heading-primary mb-4">
          Algo salió mal
        </h1>
        
        <p className="text-lg text-secondary mb-6">
          Lo sentimos, ocurrió un error inesperado. Puedes intentar recargar la página.
        </p>
        
        {error.message && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-primary hover:text-secondary transition-colors mb-2">
              Detalles técnicos
            </summary>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Intentar de nuevo
          </button>
          
          <a
            href="/inicio"
            className="btn-secondary inline-block"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
