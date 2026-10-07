"use client";

import { use } from "react";
import { BranchDetailsView } from "@/features/branches/branch-details-view";

export default function BranchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BranchDetailsView branchId={id} />;
}
