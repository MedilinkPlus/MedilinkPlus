import HospitalDetail from './HospitalDetail';

// Provide static params for export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  return <HospitalDetail hospitalId={params.id} />;
}