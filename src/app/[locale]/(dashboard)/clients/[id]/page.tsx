"use client";

import { use } from "react";
import { ClientDetailsView } from "@/features/clients/client-details-view";

export default function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ClientDetailsView clientId={id} />;
}
