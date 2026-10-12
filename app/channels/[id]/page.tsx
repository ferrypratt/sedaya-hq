import { notFound } from 'next/navigation';
import { INITIAL_CHANNELS } from '@/lib/data/seed-channels';
import { ChannelDetailView } from '@/components/modules/channels/channel-detail-view';

export function generateStaticParams() {
  return INITIAL_CHANNELS.map((channel) => ({
    id: channel.id,
  }));
}

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const channel = INITIAL_CHANNELS.find((c) => c.id === id);

  if (!channel) {
    notFound();
  }

  return <ChannelDetailView channel={channel} />;
}
