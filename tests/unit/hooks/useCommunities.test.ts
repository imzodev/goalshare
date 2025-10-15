import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCommunitiesTopics } from "@/hooks/useCommunities";

const originalFetch = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch as any;
});

describe("useCommunitiesTopics", () => {
  it("no carga cuando open=false y carga cuando open=true", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ communities: [{ id: "c1", name: "Fitness", slug: "fitness" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      );
    global.fetch = fetchMock as any;

    const { result, rerender } = renderHook(({ open }) => useCommunitiesTopics(open), {
      initialProps: { open: false },
    });

    // Inicialmente no debe cargar
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);

    // Cambiar a open=true dispara carga
    await act(async () => {
      rerender({ open: true });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([{ id: "c1", name: "Fitness", slug: "fitness" }]);
  });

  it("maneja error y permite reload manual", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "boom" }), { status: 500 }) as any)
      .mockResolvedValueOnce(new Response(JSON.stringify({ communities: [] }), { status: 200 }) as any);
    global.fetch = fetchMock as any;

    const { result } = renderHook(() => useCommunitiesTopics(true));

    // Primera carga con error
    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toEqual([]);

    // Reload exitoso
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([]);
  });
});
