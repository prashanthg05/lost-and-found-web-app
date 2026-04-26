import { supabase } from "@/lib/supabase";
import { BrowseView } from "@/components/browse-view";

export const revalidate = 0; // Dynamic rendering

export default async function BrowsePage() {
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Browse Items</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Look through reported lost and found items. Click on an item to see more details or claim it.
        </p>
      </div>

      <BrowseView items={items || []} />
    </div>
  );
}
