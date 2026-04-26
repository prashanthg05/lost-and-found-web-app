"use client";

import { useState, useMemo } from "react";
import { ItemCard } from "@/components/item-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type Item = {
  id: string;
  type: string;
  name: string;
  description: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  contact_info: string;
  status: string;
  created_at: string;
};

export function BrowseView({ items }: { items: Item[] }) {
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by tab
      if (item.type !== activeTab) return false;
      
      // Filter by search query
      if (!searchQuery) return true;
      
      const lowerQuery = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.location_text.toLowerCase().includes(lowerQuery)
      );
    });
  }, [items, activeTab, searchQuery]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("lost")}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "lost" 
                ? "bg-white shadow-sm text-red-600" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setActiveTab("found")}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "found" 
                ? "bg-white shadow-sm text-green-600" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Found Items
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder={`Search ${activeTab} items...`}
          className="pl-10 h-12 text-lg rounded-xl bg-white border-slate-200 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-xl text-muted-foreground">
            No {activeTab} items match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
