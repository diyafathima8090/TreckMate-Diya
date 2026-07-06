"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentService, apiClient } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, LayoutGrid, Map, Image as ImageIcon } from "lucide-react";

export default function ContentManagement() {
  const queryClient = useQueryClient();

  
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catModalOpen, setCatModalOpen] = useState(false);

  const [destName, setDestName] = useState("");
  const [destCountry, setDestCountry] = useState("");
  const [destModalOpen, setDestModalOpen] = useState(false);

  
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  
  const { data: catResponse, isLoading: catsLoading } = useQuery({ queryKey: ["categories"], queryFn: ContentService.getCategories });
  const { data: destResponse, isLoading: destsLoading } = useQuery({ queryKey: ["destinations"], queryFn: ContentService.getDestinations });
  const { data: bannerResponse, isLoading: bannersLoading } = useQuery({ queryKey: ["banners"], queryFn: ContentService.getBanners });

  
  const categoryMutation = useMutation({
    mutationFn: ContentService.saveCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCatName("");
      setCatDesc("");
      setCatModalOpen(false);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: ContentService.deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
  });

  const destinationMutation = useMutation({
    mutationFn: ContentService.saveDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      setDestName("");
      setDestCountry("");
      setDestModalOpen(false);
    }
  });

  const deleteDestMutation = useMutation({
    mutationFn: ContentService.deleteDestination,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinations"] })
  });

  const toggleBannerMutation = useMutation({
    mutationFn: ContentService.toggleBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] })
  });

  const bannerMutation = useMutation({
    mutationFn: ContentService.saveBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setBannerTitle("");
      setBannerLink("");
      setBannerFile(null);
      setBannerImageUrl("");
      setPreviewUrl("");
      setBannerModalOpen(false);
    }
  });

  const deleteBannerMutation = useMutation({
    mutationFn: ContentService.deleteBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] })
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await apiClient.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        if (res.data && res.data.success) {
          setBannerImageUrl(res.data.imageUrl);
        } else {
          alert("Failed to upload image. Please try entering a URL or retry.");
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        
        const fallbackOptions = [
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
          "https://images.unsplash.com/photo-1472396961693-142e6e269027"
        ];
        const randomFallback = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        setBannerImageUrl(randomFallback);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerLink || (!bannerImageUrl && !bannerFile)) return;
    bannerMutation.mutate({ 
      title: bannerTitle, 
      link: bannerLink, 
      imageUrl: bannerImageUrl 
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catDesc) return;
    categoryMutation.mutate({ name: catName, description: catDesc });
  };

  const handleCreateDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName || !destCountry) return;
    destinationMutation.mutate({ name: destName, country: destCountry });
  };

  const categories: any[] = catResponse?.data || [];
  const destinations: any[] = destResponse?.data || [];
  const banners: any[] = bannerResponse?.data || [];

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Content Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administer categories, slider marketing banners, and spotlight destinations.
        </p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories" className="flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex items-center gap-1.5">
            <Map className="h-4 w-4" /> Spotlights
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4" /> Banners
          </TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Trip Categories</CardTitle>
                <CardDescription>Configure search taxonomy metadata.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setCatModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {catsLoading ? (
                <div className="space-y-2 animate-pulse"><div className="h-10 bg-muted rounded"></div></div>
              ) : categories.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No categories defined.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Published Treks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c: any) => (
                      <TableRow key={c.id} className="hover:bg-slate-500/5">
                        <TableCell className="font-bold">{c.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-xs">{c.description}</TableCell>
                        <TableCell>{c.count} active treks</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => deleteCategoryMutation.mutate(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="destinations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Destination Spotlights</CardTitle>
                <CardDescription>Manage regional groupings highlighted for hikers.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setDestModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Spotlight
              </Button>
            </CardHeader>
            <CardContent>
              {destsLoading ? (
                <div className="space-y-2 animate-pulse"><div className="h-10 bg-muted rounded"></div></div>
              ) : destinations.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No destinations spotlighted.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destination</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Published Treks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.map((d: any) => (
                      <TableRow key={d.id} className="hover:bg-slate-500/5">
                        <TableCell className="font-bold">{d.name}</TableCell>
                        <TableCell className="text-xs">{d.country}</TableCell>
                        <TableCell>{d.treks} treks in area</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => deleteDestMutation.mutate(d.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="banners">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Home Slider Banner Promos</CardTitle>
                <CardDescription>Review campaign sliders active on the hiker client portal.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setBannerModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Banner
              </Button>
            </CardHeader>
            <CardContent>
              {bannersLoading ? (
                <div className="space-y-2 animate-pulse"><div className="h-10 bg-muted rounded"></div></div>
              ) : banners.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground">No marketing banners configured.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((b: any) => (
                    <div key={b.id} className="border border-border/70 rounded-xl overflow-hidden bg-muted/20 relative group hover:shadow-md transition-shadow">
                      <button 
                        onClick={() => deleteBannerMutation.mutate(b.id)}
                        className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-rose-600 text-white rounded-full p-2 transition-colors z-10"
                        title="Delete Banner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <img src={b.imageUrl} alt={b.title} className="h-40 w-full object-cover border-b border-border/50" />
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm">{b.title}</h4>
                          <Badge variant={b.isActive ? "success" : "secondary"}>{b.isActive ? "Active" : "Disabled"}</Badge>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground">Target Route: {b.link}</p>
                        <div className="pt-2 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => toggleBannerMutation.mutate(b.id)}>
                            {b.isActive ? (
                              <><EyeOff className="h-3.5 w-3.5 mr-1" /> Deactivate Banner</>
                            ) : (
                              <><Eye className="h-3.5 w-3.5 mr-1" /> Activate Banner</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent onClose={() => setCatModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Trekking Category</DialogTitle>
            <DialogDescription>Define a new segment key for user filtering.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Category Name</label>
              <Input type="text" placeholder="e.g. Forest Hike" value={catName} onChange={(e) => setCatName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Description</label>
              <textarea
                rows={3}
                placeholder="Explain the difficulty profile of this category..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                required
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={destModalOpen} onOpenChange={setDestModalOpen}>
        <DialogContent onClose={() => setDestModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Destination Spotlight</DialogTitle>
            <DialogDescription>Add a new focus area location to filter hikes.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDestination} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Destination Region</label>
              <Input type="text" placeholder="e.g. Swiss Alps" value={destName} onChange={(e) => setDestName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Country Location</label>
              <Input type="text" placeholder="e.g. Switzerland" value={destCountry} onChange={(e) => setDestCountry(e.target.value)} required />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDestModalOpen(false)}>Cancel</Button>
              <Button type="submit">Publish Spotlight</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={bannerModalOpen} onOpenChange={setBannerModalOpen}>
        <DialogContent onClose={() => setBannerModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Marketing Banner</DialogTitle>
            <DialogDescription>Create a new promotional slider banner for the hiker app homepage.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBanner} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Banner Title *</label>
              <Input 
                type="text" 
                placeholder="e.g. Winter Expedition Discounts" 
                value={bannerTitle} 
                onChange={(e) => setBannerTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Target Route / Link *</label>
              <Input 
                type="text" 
                placeholder="e.g. /trips?sale=winter or /category/snow" 
                value={bannerLink} 
                onChange={(e) => setBannerLink(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Banner Image *</label>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="cursor-pointer"
                  />
                </div>
                {isUploading && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold animate-pulse">Uploading image to cloud...</span>
                )}

                <div className="flex items-center gap-2 select-none py-1">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">OR</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                <Input 
                  type="url" 
                  placeholder="Paste direct Image URL (e.g. https://images.unsplash.com/...)" 
                  value={bannerImageUrl} 
                  onChange={(e) => setBannerImageUrl(e.target.value)} 
                />
              </div>

              {(bannerImageUrl || previewUrl) && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={bannerImageUrl || previewUrl} 
                    alt="Preview" 
                    className="h-24 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBannerModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUploading || (!bannerImageUrl && !bannerFile)}>
                Create Banner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
