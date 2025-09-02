// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
} from "../../components/ui/button";


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  Headphones,
  TrendingUp,
  Eye,
  BarChart3,
  Upload,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { podcastService } from "../../services/podcastService";
import type { Podcast, CreatePodcastRequest } from "../../types";

/**
 * Podcasts (MUI-free)
 * - Tailwind + shadcn/ui components only
 * - Replicates tabs, cards, analytics, and CRUD dialog
 * - Polished, lightweight, and tree-shakeable
 */

const statCard = (
  {
    icon: Icon,
    label,
    value,
    accent = "from-indigo-500 to-purple-500",
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    value: React.ReactNode;
    accent?: string;
  }
) => (
  <Card className="h-full border-transparent bg-white/70 backdrop-blur-xl shadow-xl">
    <CardContent className="p-5 text-center">
      <Icon className="mx-auto mb-2 h-8 w-8 text-indigo-500" />
      <div className={`mx-auto mb-2 h-1 w-12 rounded-full bg-gradient-to-r ${accent}`} />
      <div className="text-3xl font-semibold tracking-tight text-indigo-600">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <Card className="border-dashed bg-white/70 backdrop-blur-xl">
    <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="rounded-2xl bg-indigo-50 p-4">
        <Headphones className="h-8 w-8 text-indigo-500" />
      </div>
      <CardTitle className="text-2xl">No podcasts yet</CardTitle>
      <CardDescription>
        Upload your first episode to get started.
      </CardDescription>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="h-4 w-4" /> Upload Podcast
      </Button>
    </CardContent>
  </Card>
);

const CoverImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => (
  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src || "/default-podcast-cover.jpg"}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
      loading="lazy"
    />
    </div>
  );

const Podcasts: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "published" | "drafts" | "analytics">(
    "all"
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<CreatePodcastRequest>({
    title: "",
    description: "",
    audioUrl: "",
    category: "",
    tags: [],
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const resp = await podcastService.getArtistPodcasts("current-artist-id");
      const data = resp?.data?.data as unknown as Podcast[];
      setPodcasts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load podcasts");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setForm({ title: "", description: "", audioUrl: "", category: "", tags: [] });
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(p: Podcast) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      audioUrl: p.audioUrl,
      category: p.category,
      tags: p.tags || [],
    });
    setOpen(true);
  }

  async function handleSubmit() {
    try {
      setUploading(true);
      if (editing) {
        await podcastService.updatePodcast(editing._id, form);
        toast.success("Podcast updated");
      } else {
        await podcastService.createPodcast(form);
        toast.success("Podcast created");
      }
      setOpen(false);
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save podcast");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this podcast?");
    if (!ok) return;
    try {
      await podcastService.deletePodcast(id);
      toast.success("Podcast deleted");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete podcast");
    }
  }

  async function handleTogglePublish(id: string, isPublished: boolean) {
    try {
      await podcastService.togglePublishStatus(id, !isPublished);
      toast.success(!isPublished ? "Published" : "Unpublished");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  }

  const totals = useMemo(() => {
    const published = podcasts.filter((p) => p.isPublished).length;
    const listeners = podcasts.reduce((s, p) => s + (p.listeners || 0), 0);
    const likes = podcasts.reduce((s, p) => s + (p.likes || 0), 0);
    return { published, listeners, likes };
  }, [podcasts]);

  const filtered = useMemo(() => {
    if (tab === "published") return podcasts.filter((p) => p.isPublished);
    if (tab === "drafts") return podcasts.filter((p) => !p.isPublished);
    return podcasts;
  }, [podcasts, tab]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent">
              My Podcasts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your podcast content and track performance
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Upload Podcast
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCard({ icon: Headphones, label: "Total Podcasts", value: podcasts.length })}
          {statCard({ icon: Play, label: "Published", value: totals.published, accent: "from-emerald-500 to-teal-500" })}
          {statCard({ icon: TrendingUp, label: "Total Listeners", value: totals.listeners, accent: "from-amber-500 to-orange-500" })}
          {statCard({ icon: Eye, label: "Total Likes", value: totals.likes, accent: "from-pink-500 to-rose-500" })}
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6 border-white/60 bg-white/80 shadow-2xl backdrop-blur-2xl">
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Podcasts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* All / Published / Drafts */}
            {(["all", "published", "drafts"] as const).map((key) => (
              <TabsContent key={key} value={key} className="mt-6">
                {loading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-[16/9] w-full" />
                        <CardContent className="space-y-3 p-4">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                </CardContent>
              </Card>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState onCreate={openCreate} />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p) => (
                      <Card
                        key={p._id}
                        className="group overflow-hidden border-white/60 bg-white/80 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <CardHeader className="p-0">
                          <CoverImage src={p.coverImage} alt={p.title} />
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                          <CardTitle className="truncate text-lg">{p.title}</CardTitle>
                          <CardDescription className="line-clamp-3">
                            {p.description}
                          </CardDescription>
                          <div className="flex flex-wrap items-center gap-2">
                            {p.category && (
                              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600">
                                {p.category}
                              </Badge>
                            )}
                            <Badge variant={p.isPublished ? "default" : "secondary"}>
                              {p.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {formatDuration(p.duration)} • {p.listeners} listeners
                            </span>
                            <div className="flex items-center gap-1">
                              {tab !== "published" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-emerald-600"
                                  onClick={() => handleTogglePublish(p._id, p.isPublished)}
                                  title={p.isPublished ? "Unpublish" : "Publish"}
                                >
                                  {p.isPublished ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-indigo-600"
                                onClick={() => openEdit(p)}
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-rose-600"
                                onClick={() => handleDelete(p._id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                </CardContent>
              </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}

            {/* Analytics */}
            <TabsContent value="analytics" className="mt-6">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Podcast Analytics</h3>
                    <p className="text-xs text-muted-foreground">
                      Overview of engagement across episodes
                    </p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {podcasts.length} items
                  </Badge>
                </div>

                <ScrollArea className="w-full">
            <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Podcast</TableHead>
                        <TableHead className="w-[110px]">Listeners</TableHead>
                        <TableHead className="w-[90px]">Likes</TableHead>
                        <TableHead className="w-[100px]">Duration</TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                </TableRow>
                    </TableHeader>
              <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : podcasts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No data yet.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        podcasts.map((p) => (
                          <TableRow key={p._id} className="hover:bg-indigo-50/30">
                            <TableCell className="font-medium">{p.title}</TableCell>
                            <TableCell>{p.listeners}</TableCell>
                            <TableCell>{p.likes}</TableCell>
                            <TableCell>{formatDuration(p.duration)}</TableCell>
                    <TableCell>
                              <Badge variant={p.isPublished ? "default" : "secondary"}>
                                {p.isPublished ? "Published" : "Draft"}
                              </Badge>
                    </TableCell>
                  </TableRow>
                        ))
                      )}
              </TableBody>
            </Table>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Podcast" : "Upload New Podcast"}
        </DialogTitle>
            <DialogDescription>
              Fill in the details below. Title and Audio URL are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Episode title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
              rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio">Audio URL</Label>
              <Input
                id="audio"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                placeholder="https://.../episode.mp3"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
              <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
              </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={(form.tags || []).join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="jamaica, dancehall, interview"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
              disabled={uploading || !form.title || !form.audioUrl}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> {editing ? "Update" : "Upload"}
                </>
              )}
          </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Podcasts; 
