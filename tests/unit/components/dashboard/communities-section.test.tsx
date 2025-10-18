import { render, screen, waitFor } from "@testing-library/react";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
import { CommunitiesSection } from "@/components/dashboard/communities-section";
import { vi, describe, it, expect, beforeEach } from "vitest";

function renderWithI18n(node: React.ReactNode) {
  return render(withI18n(node));
}

describe("CommunitiesSection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders translated title, explore button and community cards with translated actions", async () => {
    const communities = [
      {
        id: "c1",
        name: "Languages",
        description: "Language learning topics",
        slug: "languages",
        kind: "topic",
        memberCount: 5,
        isMember: false,
        createdAt: new Date().toISOString(),
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ communities }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }) as any
    );

    renderWithI18n(<CommunitiesSection />);

    // Title and Explore button in ES locale
    expect(await screen.findByText("Comunidades")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Explorar" })[0]).toBeInTheDocument();

    // Card content
    await waitFor(() => {
      expect(screen.getByText("Languages")).toBeInTheDocument();
      // Subtitle for kind "topic"
      expect(screen.getByText("Comunidad de tema")).toBeInTheDocument();
      // Primary join action (ES)
      expect(screen.getByRole("button", { name: "Unirse" })).toBeInTheDocument();
    });
  });

  it("handles fetch error by not rendering cards (and stops loading)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response("fail", { status: 500 }) as any);

    renderWithI18n(<CommunitiesSection />);

    // Title should still render
    expect(await screen.findByText("Comunidades")).toBeInTheDocument();

    // After error, there should be no community names
    await waitFor(() => {
      expect(screen.queryByText("Languages")).not.toBeInTheDocument();
    });
  });
});
