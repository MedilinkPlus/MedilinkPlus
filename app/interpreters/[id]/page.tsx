import InterpreterProfile from './InterpreterProfile';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default function InterpreterProfilePage({ params }: { params: { id: string } }) {
  return <InterpreterProfile interpreterId={params.id} />;
}