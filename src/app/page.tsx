import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6">
        Campus <span className="text-primary">Lost & Found</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-[600px]">
        Did you lose something or find something that belongs to someone else? 
        Help keep our campus community connected.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Link href="/report?type=lost" className="w-full">
          <Button size="lg" className="w-full text-lg h-16 rounded-2xl flex items-center gap-3">
            <Search className="w-6 h-6" />
            I Lost an Item
          </Button>
        </Link>
        <Link href="/report?type=found" className="w-full">
          <Button size="lg" variant="secondary" className="w-full text-lg h-16 rounded-2xl flex items-center gap-3 border-2 border-primary/20">
            <PlusCircle className="w-6 h-6" />
            I Found an Item
          </Button>
        </Link>
      </div>
      
      <div className="mt-16">
        <Link href="/browse">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary">
            Browse all reported items &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
}
