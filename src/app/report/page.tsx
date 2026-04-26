import { ReportForm } from "@/components/report-form";
import { Suspense } from "react";

// Need to wrap in Suspense because we might read searchParams on client side
export default function ReportPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const initialType = searchParams.type === "found" ? "found" : "lost";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Report Item</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Help us keep track of lost and found items. Please provide as much detail as possible to help identify the item.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading form...</div>}>
        <ReportForm initialType={initialType} />
      </Suspense>
    </div>
  );
}
