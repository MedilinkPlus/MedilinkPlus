
import RequestDetail from './RequestDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  return <RequestDetail requestId={params.id} />;
}
