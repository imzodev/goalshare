"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/date-utils";
import { CalendarDays, Flame, Heart, MessageCircle, Sparkles, Star, Target, Trophy, Users } from "lucide-react";

interface CommunityPageClientProps {
  communityId: string;
  community: {
    name: string;
    description?: string | null;
    kind: string;
    memberCount: number;
  };
  currentUser: {
    id: string;
    name: string;
    username?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  };
  initialPosts: Array<{
    id: string;
    communityId: string;
    body: string;
    createdAt: string;
    author: {
      userId: string;
      displayName?: string | null;
      username?: string | null;
      imageUrl?: string | null;
    };
  }>;
}

interface FeedPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorTagline: string;
  authorAvatar?: string;
  tags: string[];
  reactions: {
    likes: number;
    comments: number;
  };
  attachments: Array<{ type: string; name: string; url: string }>;
  isOptimistic?: boolean;
}

const MOCK_COMMUNITY_HIGHLIGHTS = {
  coverGradient: "from-purple-600 via-blue-600 to-cyan-500",
  categories: ["Productividad", "Crecimiento Personal", "Accountability"],
  stats: [
    { label: "Miembros activos", icon: Users },
    { label: "Metas en progreso", icon: Target },
    { label: "Retos completados", icon: Trophy },
  ],
  announcements: [
    {
      id: "1",
      title: "Reto Deep Work de Octubre",
      description:
        "Nos enfocaremos en bloques de 2 horas para avanzar en nuestras metas más importantes. Comparte tu progreso cada viernes",
      icon: Flame,
      accent: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
    },
    {
      id: "2",
      title: "Sesión AMA con líderes",
      description:
        "Invitamos a creators destacados a compartir cómo diseñan sus sistemas de accountability. Sábado 12 de octubre, 11am",
      icon: Sparkles,
      accent: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
    },
  ],
  ideas: [
    {
      title: "Sesión focus colectivo",
      body: "Coordina un bloque de productividad compartido por Zoom con los miembros que trabajan remoto.",
    },
    {
      title: "Panel de retrospectiva",
      body: "Invita a los top 3 miembros a compartir qué hábitos les funcionan cada fin de mes.",
    },
    {
      title: "Ruta de bienvenida",
      body: "Documenta los primeros pasos ideales para nuevos miembros y comparte plantillas clave.",
    },
  ],
  topMembers: [
    {
      id: "member-1",
      name: "Nayeli García",
      avatar: "https://i.pravatar.cc/150?img=25",
      role: "Community Builder",
      streak: 42,
      kudos: 128,
    },
    {
      id: "member-2",
      name: "Diego Fernández",
      avatar: "https://i.pravatar.cc/150?img=12",
      role: "Product Strategist",
      streak: 37,
      kudos: 112,
    },
    {
      id: "member-3",
      name: "Mariana León",
      avatar: "https://i.pravatar.cc/150?img=65",
      role: "Growth Marketer",
      streak: 29,
      kudos: 96,
    },
    {
      id: "member-4",
      name: "Luis Ortega",
      avatar: "https://i.pravatar.cc/150?img=44",
      role: "No-code Maker",
      streak: 24,
      kudos: 87,
    },
  ],
};

function deriveTitleFromContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const firstSentenceMatch = trimmed.match(/[^.!?\n]{3,}[.!?]/);
  if (firstSentenceMatch) {
    return firstSentenceMatch[0].trim();
  }

  const slice = trimmed.slice(0, 80);
  return slice.length < trimmed.length ? `${slice.trim()}...` : slice.trim();
}

function mapToFeedPost(post: CommunityPageClientProps["initialPosts"][number]): FeedPost {
  const title = deriveTitleFromContent(post.body);
  const authorName = post.author.displayName || post.author.username || "Miembro de GoalShare";
  const authorTagline = post.author.username ? `@${post.author.username}` : "Miembro comprometido";

  return {
    id: post.id,
    title,
    content: post.body,
    createdAt: post.createdAt,
    authorName,
    authorTagline,
    authorAvatar: post.author.imageUrl ?? undefined,
    tags: ["Actualización"],
    reactions: {
      likes: 0,
      comments: 0,
    },
    attachments: [],
  };
}

export function CommunityProfile({ communityId, community, currentUser, initialPosts }: CommunityPageClientProps) {
  const [posts, setPosts] = useState<FeedPost[]>(() => initialPosts.map(mapToFeedPost));
  const [newPostContent, setNewPostContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const communityDescription = useMemo(() => {
    if (community.description && community.description.trim().length > 0) {
      return community.description;
    }
    switch (community.kind) {
      case "domain":
        return "Explora tácticas y aprendizajes para dominar este dominio.";
      case "topic":
        return "Comparte avances, dudas y recursos para este tema.";
      case "cohort":
        return "Coordina avances y mantén la accountability con tu cohorte.";
      default:
        return "Comparte tu progreso con creadores que buscan alcanzar sus metas.";
    }
  }, [community.description, community.kind]);

  const handleCreatePost = useCallback(async () => {
    const content = newPostContent.trim();
    if (!content || isPublishing) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticPost: FeedPost = {
      id: tempId,
      title: deriveTitleFromContent(content),
      content,
      createdAt: new Date().toISOString(),
      authorName: currentUser.name,
      authorTagline: currentUser.username ? `@${currentUser.username}` : "Tú",
      authorAvatar: currentUser.avatarUrl ?? undefined,
      tags: ["Actualización"],
      reactions: { likes: 0, comments: 0 },
      attachments: [],
      isOptimistic: true,
    };

    setPosts((prev) => [optimisticPost, ...prev]);
    setNewPostContent("");
    setIsPublishing(true);

    try {
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "No se pudo publicar el post" }));
        throw new Error(errorData.error || "No se pudo publicar el post");
      }

      const { post } = (await response.json()) as { post: CommunityPageClientProps["initialPosts"][number] };
      const mapped = mapToFeedPost(post);

      setPosts((prev) => prev.map((item) => (item.id === tempId ? mapped : item)));
      toast.success("Tu actualización fue publicada");
    } catch (error) {
      setPosts((prev) => prev.filter((item) => item.id !== tempId));
      setNewPostContent(content);
      const message = error instanceof Error ? error.message : "Ocurrió un error al publicar";
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [communityId, currentUser.avatarUrl, currentUser.name, currentUser.username, isPublishing, newPostContent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden">
          <div
            className={cn(
              "mx-auto h-full w-full max-w-5xl rounded-3xl bg-gradient-to-br blur-[120px] opacity-50",
              MOCK_COMMUNITY_HIGHLIGHTS.coverGradient
            )}
          />
        </div>

        <section className="relative z-10 rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-xl transition-colors dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-8 p-8 lg:grid-cols-[minmax(0,_1fr)_280px] lg:p-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-slate-900/10 text-slate-900 uppercase tracking-wide dark:bg-white/10 dark:text-white">
                    {communityId}
                  </Badge>
                  <h1 className="text-3xl font-bold sm:text-4xl">{community.name}</h1>
                  <p className="mt-2 text-lg text-slate-600 dark:text-white/80">{communityDescription}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="rounded-full bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 hover:text-slate-900 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Conversar
                  </Button>
                  <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                    <Heart className="mr-2 h-4 w-4" />
                    Seguir
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {MOCK_COMMUNITY_HIGHLIGHTS.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="border border-slate-200/70 bg-slate-900/5 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              <p className="text-base leading-relaxed text-slate-600 dark:text-white/80">
                Esta comunidad cuenta con {community.memberCount.toLocaleString()} miembros activos. Comparte avances,
                pide retroalimentación y recibe apoyo constante para mantener tu momentum.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {MOCK_COMMUNITY_HIGHLIGHTS.stats.map((stat, index) => (
                  <Card
                    key={stat.label}
                    className="border border-slate-200/70 bg-white/90 text-slate-900 backdrop-blur-lg transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <stat.icon className="h-5 w-5 text-slate-500 dark:text-white/60" />
                      <div>
                        <p className="text-2xl font-semibold">
                          {index === 0 ? community.memberCount.toLocaleString() : index === 1 ? "87" : "312"}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60">
                          {stat.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border border-slate-200/70 bg-white/80 shadow-lg dark:border-white/10 dark:bg-black/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-white/80">
                    <CalendarDays className="h-4 w-4" />
                    Próximos anuncios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MOCK_COMMUNITY_HIGHLIGHTS.announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 transition-colors dark:border-white/10 dark:bg-white/5"
                    >
                      <div
                        className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-xs", announcement.accent)}
                      >
                        <announcement.icon className="h-3 w-3" />
                        <span>{announcement.title}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-white/70">{announcement.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="relative z-10 mt-12 grid gap-8 lg:grid-cols-[minmax(0,_1fr)_320px]">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white/90">Actividad reciente</h2>
              <Button
                variant="ghost"
                className="text-slate-600 hover:bg-slate-900/10 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Ver filtros
              </Button>
            </div>

            <Card className="border border-slate-200/70 bg-white text-slate-900 transition-colors dark:border-white/10 dark:bg-black/30 dark:text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-white/80">
                  <MessageCircle className="h-4 w-4" />
                  Comparte tu progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-11 w-11 border border-slate-200/70 dark:border-white/10">
                    <AvatarImage src={currentUser.avatarUrl ?? undefined} alt={currentUser.name} />
                    <AvatarFallback className="bg-slate-900/10 text-slate-700 dark:bg-white/10 dark:text-white">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <Textarea
                      value={newPostContent}
                      onChange={(event) => setNewPostContent(event.target.value)}
                      placeholder="Comparte un update con la comunidad..."
                      maxLength={1000}
                      className="min-h-[120px] resize-none border-slate-200/70 bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus-visible:ring-white/30"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-white/50">
                      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 dark:border-white/20">
                        <Sparkles className="h-3 w-3" />
                        Imagen próximamente
                      </span>
                      <div className="flex items-center gap-3">
                        <span>{newPostContent.trim().length}/1000</span>
                        <Button
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim() || isPublishing}
                          className="rounded-full bg-slate-900 px-5 text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          {isPublishing ? "Compartiendo..." : "Compartir progreso"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className={cn(
                    "border border-slate-200/70 bg-white text-slate-900 backdrop-blur-xl shadow-2xl shadow-primary/5 transition-colors dark:border-white/10 dark:bg-black/40 dark:text-white",
                    post.isOptimistic && "opacity-80"
                  )}
                >
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-slate-200/70 dark:border-white/10">
                        <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                        <AvatarFallback className="bg-slate-900/10 text-slate-700 dark:bg-white/10 dark:text-white">
                          {post.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          {post.title || "Actualización"}
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                          {post.authorName} • {post.authorTagline} • {formatRelativeTime(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="border border-slate-200/70 bg-slate-900/5 text-xs uppercase tracking-wide text-slate-700 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-slate-700 dark:text-white/80">
                    <p>{post.content}</p>

                    {post.attachments.length > 0 && (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-100/70 p-4 transition-colors dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60">Adjuntos</p>
                        <Separator className="my-3 bg-slate-200 dark:bg-white/10" />
                        <div className="flex flex-wrap gap-3">
                          {post.attachments.map((attachment) => (
                            <Button
                              key={attachment.name}
                              variant="secondary"
                              size="sm"
                              className="rounded-full border border-slate-200/70 bg-slate-900/5 text-slate-800 hover:bg-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                            >
                              <Star className="mr-2 h-3 w-3" />
                              {attachment.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-wrap items-center gap-4 border-t border-slate-200/70 bg-slate-50/80 px-6 py-4 text-sm text-slate-600 transition-colors dark:border-white/5 dark:bg-white/[0.02] dark:text-white/70">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:bg-slate-900/10 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <Heart className="mr-2 h-4 w-4" /> {post.reactions.likes} agradecimientos
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:bg-slate-900/10 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> {post.reactions.comments} comentarios
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="border border-slate-200/70 bg-white text-slate-900 backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-black/40 dark:text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-white/80">
                  <Trophy className="h-4 w-4" />
                  Miembros destacados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[360px] px-6">
                  <div className="space-y-4 py-4">
                    {MOCK_COMMUNITY_HIGHLIGHTS.topMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-slate-200/70 bg-slate-100/80 p-4 transition-colors dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200/70 dark:border-white/10">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="bg-slate-900/10 text-slate-700 dark:bg-white/10 dark:text-white">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {index + 1}. {member.name}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <Badge className="rounded-full bg-slate-900/10 text-xs font-medium text-slate-800 dark:bg-white/10 dark:text-white">
                            {member.kudos} kudos
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 dark:text-white/60">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                            {member.streak} días streak
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                            {member.kudos} agradecimientos
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/70 bg-white text-slate-900 backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-black/30 dark:text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-white/80">
                  <Sparkles className="h-4 w-4" />
                  Ideas para impulsar la comunidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_COMMUNITY_HIGHLIGHTS.ideas.map((idea) => (
                  <div
                    key={idea.title}
                    className="rounded-2xl border border-slate-200/70 bg-slate-100/80 p-4 text-sm text-slate-700 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{idea.title}</p>
                    <p className="mt-2">{idea.body}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                  Compartir propuesta
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
