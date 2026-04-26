import { supabase } from "@/lib/supabase";
import { ItemCard } from "@/components/item-card";

export const revalidate = 0; // Dynamic rendering

export default async function BrowsePage() {
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
  }

  const lostItems = items?.filter(item => item.type === 'lost') || [];
  const foundItems = items?.filter(item => item.type === 'found') || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Browse Items</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Look through reported lost and found items. Click on an item to see more details or claim it.
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
            <span className="bg-red-100 text-red-700 p-2 rounded-lg text-sm uppercase tracking-wider">Lost</span>
            Recently Lost
          </h2>
          {lostItems.length === 0 ? (
            <p className="text-muted-foreground">No lost items reported yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
            <span className="bg-green-100 text-green-700 p-2 rounded-lg text-sm uppercase tracking-wider">Found</span>
            Recently Found
          </h2>
          {foundItems.length === 0 ? (
            <p className="text-muted-foreground">No found items reported yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
