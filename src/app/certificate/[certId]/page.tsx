import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CertificateClient from './CertificateClient';

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { certificateId: certId },
    include: {
      student: true,
      course: { include: { trainer: true } },
    },
  });

  if (!cert) notFound();

  return <CertificateClient cert={cert} />;
}
