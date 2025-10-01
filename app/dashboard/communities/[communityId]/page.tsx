import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { CommunityProfile } from "@/components/communities/community-profile";
import { CommunitiesService } from "@/services/communities-service";
import { PostsService, type CommunityPostDTO } from "@/services/posts-service";

interface PageProps {
  params: {
    communityId: string;
  };
}

const communitiesService = new CommunitiesService();
const postsService = new PostsService();

export default async function CommunityPage({ params }: PageProps) {
  const { communityId } = params;

  if (!communityId) {
    notFound();
  }

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

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
        name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Miembro de GoalShare",
        username: user.username ?? user.primaryEmailAddress?.emailAddress ?? null,
        avatarUrl: user.imageUrl ?? undefined,
        role: community.userRole ?? "member",
      }}
      initialPosts={posts}
    />
  );
}
