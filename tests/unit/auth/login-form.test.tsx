import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";
import * as supabaseClient from "@/lib/supabase/client";
const __mockSupabase: any = (supabaseClient as any).__mockSupabase;

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza encabezado y campos", () => {
    render(<LoginForm />);
    expect(screen.getAllByText("Iniciar sesión").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("inicia sesión con email y password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "john@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(__mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "john@test.com",
      password: "secret123",
    });
  });

  it("botón Google dispara OAuth google", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /google/i }));

    expect(__mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    const call = (__mockSupabase.auth.signInWithOAuth as any).mock.calls[0][0];
    expect(call.provider).toBe("google");
  });

  it("botón GitHub dispara OAuth github", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /github/i }));

    expect(__mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    const call = (__mockSupabase.auth.signInWithOAuth as any).mock.calls.at(-1)[0];
    expect(call.provider).toBe("github");
  });
});
