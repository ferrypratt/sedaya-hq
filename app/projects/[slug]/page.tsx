import { notFound } from 'next/navigation';
import { INITIAL_PROJECTS } from '@/lib/data/seed-data';
import { ProjectDetailView } from '@/components/modules/projects/project-detail-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return INITIAL_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = INITIAL_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailView project={project} />;
}
