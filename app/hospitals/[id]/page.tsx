import HospitalDetail from './HospitalDetail';

// Provide an empty list to satisfy static export; only linked UUID pages will be generated.
export async function generateStaticParams() {
  return [] as { id: string }[]
}

// Prevent Next.js from trying to generate unknown dynamic params during export
export const dynamicParams = false;

export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  return <HospitalDetail hospitalId={params.id} />;
}