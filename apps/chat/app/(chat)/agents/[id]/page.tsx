
import { type Metadata } from 'next';
import { AgentProfile } from '@/components/agent-profile';
import { createClient } from '@/utils/supabase/server';

type Params = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params
}: Params): Promise<Metadata> {

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // decode the uri for usernames that have spaces in them
  const agentName = decodeURIComponent(params.id)

  const { data: agentData } = await supabase
    .from('assets')
    .select('*')
    .eq('name', agentName)
    .single();

  const meta = {
    title: agentData?.name ?? 'Agent not found!',
    description: agentData?.description ?? '',
    cardImage: agentData?.preview_image ?? '',
    robots: 'follow, index',
    favicon: '/favicon.ico',
    url: `https://chat.upstreet.ai/`
  };

  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: ['AI', 'SDK', 'Upstreet', 'Agents'],
    authors: [{ name: 'Upstreet', url: 'https://upstreet.ai/' }],
    creator: 'upstreetai',
    publisher: 'upstreetai',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title
    },
    twitter: {
      card: 'summary_large_image',
      site: '@upstreetai',
      creator: '@upstreetai',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage]
    }
  }
}

export default async function AgentProfilePage({ params }: Params) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // decode the uri for usernames that have spaces in them
  const agentName = decodeURIComponent(params.id)

  const { data: agentData } = await supabase
    .from('assets')
    .select('*')
    .eq('name', agentName)
    .single();

  if(!agentData?.start_url) return null;

  const response = await fetch(agentData.start_url);
  const jsonData = await response.json();

  const agentInfo = {
    ...agentData,
    npc: jsonData
  }

  return (
    <AgentProfile agent={agentInfo} />
  );
}