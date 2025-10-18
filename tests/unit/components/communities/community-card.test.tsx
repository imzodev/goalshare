import { render, screen, fireEvent } from "@testing-library/react";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
import { CommunityCard } from "@/components/communities/community-card";
import type { ReactNode } from "react";
import { vi, describe, it, expect } from "vitest";

function renderWithI18n(node: ReactNode) {
  return render(withI18n(node));
}

describe("CommunityCard (compact)", () => {
  const baseCommunity = {
    id: "c1",
    name: "Languages",
    description: "Language learning topics and practice",
    slug: "languages",
    kind: "topic",
    memberCount: 12,
    isMember: false,
    createdAt: new Date().toISOString(),
  } as any;

  it("renders title, compact description (ellipsis), metrics labels and primary action", () => {
    renderWithI18n(
      <CommunityCard
        community={baseCommunity}
        gradientClass="from-pink-500 to-purple-600"
        compact
        subtitle={<span>Subtype</span>}
        membersLabel="Miembros"
        activeGoalsLabel="Metas activas"
        primaryAction={{ label: "Unirse", onClick: () => void 0, className: "" }}
      />
    );

    // Title
    expect(screen.getByText(/Languages/)).toBeInTheDocument();
    // Description (should be present under title)
    expect(screen.getByText(/Language learning topics/)).toBeInTheDocument();
    // Metrics labels
    expect(screen.getByText("Miembros")).toBeInTheDocument();
    expect(screen.getByText("Metas activas")).toBeInTheDocument();
    // Primary action
    expect(screen.getByRole("button", { name: /Unirse/ })).toBeInTheDocument();
  });

  it("calls primaryAction.onClick when clicked", () => {
    const onClick = vi.fn();
    renderWithI18n(
      <CommunityCard
        community={baseCommunity}
        gradientClass="from-pink-500 to-purple-600"
        compact
        subtitle={<span>Subtype</span>}
        primaryAction={{ label: "Unirse", onClick, className: "" }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Unirse/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
