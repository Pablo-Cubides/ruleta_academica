import RuletaClient from '../../components/RuletaClient';

export default function RuletaPage() {
  // Server component: render the client-only RuletaClient which uses
  // useSearchParams and sessionStorage. This avoids prerender errors.
  return (
    <div>
      <RuletaClient />
    </div>
  );
}
