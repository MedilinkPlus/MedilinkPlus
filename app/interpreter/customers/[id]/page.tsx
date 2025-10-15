
import CustomerTimelinePage from './CustomerTimeline';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: 'ST-2024-001' },
    { id: 'PS-2024-002' },
    { id: 'NK-2024-003' },
    { id: 'WM-2024-004' },
    { id: 'LP-2024-005' },
    { id: 'MT-2024-006' },
    { id: 'ST-2024-007' },
    { id: 'PS-2024-008' },
    { id: 'NK-2024-009' },
    { id: 'WM-2024-010' },
    { id: 'LP-2024-011' },
    { id: 'MT-2024-012' },
  ];
}

export default function CustomerTimelineServerPage({ params }: { params: { id: string } }) {
  return <CustomerTimelinePage params={params} />;
}
