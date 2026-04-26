"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

export function ItemCard({ item }: { item: Item }) {
  const [isClaimed, setIsClaimed] = useState(item.status === 'claimed');
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = item.image_url ? item.image_url.split(',') : [];

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const handleClaim = async () => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'claimed' })
        .eq('id', item.id);
        
      if (error) {
        console.error("Error claiming item:", error);
        alert("Failed to claim. Check your database setup.");
        return;
      }
      
      setIsClaimed(true);
      setShowConfirm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const mapLink = (item.latitude && item.longitude) 
    ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}` 
    : null;

  return (
    <Card className={`overflow-hidden flex flex-col ${isClaimed ? 'opacity-70 grayscale-[50%]' : ''}`}>
      {images.length > 0 ? (
        <div className="w-full h-48 bg-muted relative overflow-hidden group">
          {images.map((imgUrl, index) => (
            <img 
              key={index}
              src={imgUrl} 
              alt={`${item.name} - Image ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
            />
          ))}
          
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
              {images.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
          {isClaimed && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-xl uppercase tracking-widest bg-black/60 px-4 py-2 rounded">
                Resolved
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative">
          <span className="text-slate-400">No image available</span>
          {isClaimed && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-xl uppercase tracking-widest bg-black/60 px-4 py-2 rounded">
                Resolved
              </span>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{item.location_text}</span>
          </div>
          {mapLink && (
            <a href={mapLink} target="_blank" rel="noreferrer" className="text-primary hover:underline ml-6 inline-block">
              View precise location on Map
            </a>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogTrigger render={<Button className="w-full" disabled={isClaimed} />}>
            {isClaimed ? 'Resolved' : item.type === 'lost' ? 'I found this!' : 'This is mine!'}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{item.type === 'lost' ? 'Did you find this item?' : 'Is this your item?'}</DialogTitle>
              <DialogDescription>
                Please contact the person who reported this to coordinate the return.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-slate-100 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Contact Information:</p>
                <p className="text-lg font-bold">{item.contact_info}</p>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleClaim} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Mark as Resolved
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
