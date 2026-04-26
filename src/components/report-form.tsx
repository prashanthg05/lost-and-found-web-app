"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  type: z.enum(["lost", "found"]),
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  location_text: z.string().min(2, "Location description is required."),
  contact_info: z.string().min(5, "Contact info is required."),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportForm({ initialType }: { initialType: "lost" | "found" }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialType,
      name: "",
      description: "",
      location_text: "",
      contact_info: "",
    },
  });

  useEffect(() => {
    setValue("type", initialType);
  }, [initialType, setValue]);

  const type = watch("type");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const combinedFiles = [...files, ...selectedFiles].slice(0, 3);
      
      setFiles(combinedFiles);
      
      // Cleanup old preview URLs to avoid memory leaks
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls(combinedFiles.map(f => URL.createObjectURL(f)));
      
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newUrls = [...previewUrls];
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      () => {
        alert("Unable to retrieve your location. Please ensure location services are enabled.");
        setIsGettingLocation(false);
      }
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      let imageUrls: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('item-images')
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('item-images')
              .getPublicUrl(filePath);
            imageUrls.push(publicUrlData.publicUrl);
          }
        }
      }

      const { error: insertError } = await supabase
        .from('items')
        .insert([
          {
            type: data.type,
            name: data.name,
            description: data.description,
            location_text: data.location_text,
            latitude: coordinates?.lat || null,
            longitude: coordinates?.lng || null,
            image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
            contact_info: data.contact_info,
            status: 'active'
          }
        ]);

      if (insertError) {
        console.error("Insert error details:", insertError);
        throw new Error(insertError.message || "Failed to insert into database.");
      }

      setSubmitSuccess(true);
    } catch (error: any) {
      console.error("Submission caught error:", error);
      alert("Failed to publish report: " + (error.message || "Unknown error. Check your database setup."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Successfully Reported!</h2>
          <p className="text-muted-foreground mb-6">Your item has been added to the database.</p>
          <Button onClick={() => window.location.href = '/browse'} className="w-full">
            Browse Items
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-3xl">
          {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
        </CardTitle>
        <CardDescription>
          {type === 'lost' 
            ? 'Did you lose something? Provide details so others can help you find it.' 
            : 'Did you find something? Provide details so the owner can claim it.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={type === "lost" ? "default" : "outline"}
              className="w-full"
              onClick={() => setValue("type", "lost")}
            >
              I Lost Something
            </Button>
            <Button
              type="button"
              variant={type === "found" ? "default" : "outline"}
              className="w-full"
              onClick={() => setValue("type", "found")}
            >
              I Found Something
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{type === 'lost' ? 'What did you lose?' : 'What did you find?'}</Label>
            <Input id="name" placeholder={type === 'lost' ? "e.g. Blue Hydro Flask" : "e.g. Found a pair of keys"} {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the item in detail (color, brand, distinguishing marks...)" 
              className="min-h-[100px]"
              {...register("description")} 
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
            <div className="space-y-2">
              <Label>Photos (Max 3)</Label>
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('camera-input')?.click()}
                  className="flex gap-2"
                  disabled={files.length >= 3}
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <input 
                  id="camera-input"
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('gallery-input')?.click()}
                  className="flex gap-2"
                  disabled={files.length >= 3}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Upload from Gallery
                </Button>
                <input 
                  id="gallery-input"
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <span className="text-sm text-muted-foreground w-full">
                  {files.length} / 3 photos selected
                </span>
              </div>
              
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-black/5 group border border-slate-200">
                      <img src={url} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
            <div className="space-y-2">
              <Label htmlFor="location_text">{type === 'lost' ? 'Where did you last see it?' : 'Where did you find it?'}</Label>
              <Input id="location_text" placeholder="e.g. Near the library entrance" {...register("location_text")} />
              {errors.location_text && <p className="text-red-500 text-sm">{errors.location_text.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Precise Location (Optional but helpful)</Label>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={getLocation} 
                  disabled={isGettingLocation}
                  className="flex gap-2"
                >
                  {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  Get Current Coordinates
                </Button>
                {coordinates && (
                  <span className="text-sm text-green-600 font-medium">
                    Coordinates captured!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Your Contact Info</Label>
            <Input id="contact_info" placeholder="Phone number or email" {...register("contact_info")} />
            {errors.contact_info && <p className="text-red-500 text-sm">{errors.contact_info.message}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
            ) : (
              "Publish Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
