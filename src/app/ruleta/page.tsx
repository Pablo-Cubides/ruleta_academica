import React, { Suspense } from 'react';
import RuletaClient from '../../components/RuletaClient';

export default function RuletaPage() {
  // Server component: render the client-only RuletaClient inside a
  // Suspense boundary to satisfy Next's requirements for CSR bailout.
  return (
    <Suspense fallback={<div className="text-2xl text-primary-400 p-12">Cargando...</div>}>
      <RuletaClient />
    </Suspense>
  );
}
