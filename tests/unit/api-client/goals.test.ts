import { describe, it, expect, vi, afterEach } from "vitest";
import { createGoal, createGoalMilestones } from "@/api-client/goals";
import type { MilestoneItem } from "@/types/goals";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch as any;
  vi.clearAllMocks();
});

describe("api-client/goals", () => {
  it("createGoal realiza POST y retorna goalId", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ goal: { id: "g-123" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      );
    global.fetch = fetchMock as any;

    const res = await createGoal({
      title: "Titulo",
      description: "Desc",
      deadline: null,
      topicCommunityId: "c1",
      templateId: null,
    });

    expect(res.id).toBe("g-123");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/goals",
      expect.objectContaining({ method: "POST", headers: expect.any(Object), body: expect.any(String) })
    );
  });

  it("createGoal lanza error cuando API responde error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "Bad Request" } }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }) as any
      );
    global.fetch = fetchMock as any;

    await expect(
      createGoal({ title: "t", description: "d", deadline: null, topicCommunityId: "c", templateId: null })
    ).rejects.toThrow(/Bad Request|No se pudo crear la meta/);
  });

  it("createGoal lanza error si falta goal.id en respuesta", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ goal: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      );
    global.fetch = fetchMock as any;

    await expect(
      createGoal({ title: "t", description: "d", deadline: null, topicCommunityId: "c", templateId: null })
    ).rejects.toThrow(/sin goal.id|Respuesta inválida/);
  });

  it("createGoalMilestones realiza POST y maneja errores", async () => {
    const items: MilestoneItem[] = [
      { title: "M1", weight: 50 },
      { title: "M2", weight: 50 },
    ];

    // Success
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }) as any
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "boom" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }) as any
      );

    global.fetch = fetchMock as any;

    await expect(createGoalMilestones("g-1", items)).resolves.toBeUndefined();
    await expect(createGoalMilestones("g-1", items)).rejects.toThrow(/No se pudieron guardar los milestones|boom/);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/goals/g-1/milestones",
      expect.objectContaining({ method: "POST", headers: expect.any(Object), body: JSON.stringify({ items }) })
    );
  });
});
