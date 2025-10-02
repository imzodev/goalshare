import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

import { CommunityProfile } from "@/components/communities/community-profile";
import { CommunitiesService } from "@/services/communities-service";
import { PostsService, type CommunityPostDTO } from "@/services/posts-service";

interface PageProps {
  params: Promise<{
    communityId: string;
  }>;
}

const communitiesService = new CommunitiesService();
const postsService = new PostsService();

export default async function CommunityPage({ params }: PageProps) {
  const { communityId } = await params;

  if (!communityId) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const userId = user.id;

  const community = await communitiesService.getCommunityWithDetails(userId, communityId);

  if (!community || !community.isMember) {
    notFound();
  }

  let posts: CommunityPostDTO[] = [];

  try {
    posts = await postsService.listCommunityPosts(userId, communityId, 25);
  } catch (error) {
    console.error("[CommunityPage] Error obteniendo posts:", error);
  }

  return (
    <CommunityProfile
      communityId={communityId}
      community={{
        name: community.name,
        description: community.description,
        kind: community.kind,
        memberCount: community.memberCount,
      }}
      currentUser={{
        id: userId,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Miembro de GoalShare",
        username: user.email?.split("@")[0] ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? undefined,
        role: community.userRole ?? "member",
      }}
      initialPosts={posts}
    />
  );
}
