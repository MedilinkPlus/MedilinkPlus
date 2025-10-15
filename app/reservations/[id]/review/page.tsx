import ReviewUpload from './ReviewUpload';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  return <ReviewUpload reservationId={params.id} />;
}