import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SignUpForm } from "@/components/auth/sign-up-form";
import * as supabaseClient from "@/lib/supabase/client";
import { withI18n } from "@/tests/helpers/i18n-test-wrapper";
const __mockSupabase: any = (supabaseClient as any).__mockSupabase;

// jsdom default origin is http://localhost

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza encabezado y campos", () => {
    render(withI18n(<SignUpForm />));
    expect(screen.getAllByText("Crear cuenta").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
  });

  it("registra con email/password", async () => {
    const user = userEvent.setup();
    render(withI18n(<SignUpForm />));

    await user.type(screen.getByLabelText("Correo electrónico"), "jane@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(__mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "jane@test.com",
      password: "secret123",
      options: expect.objectContaining({ emailRedirectTo: expect.stringContaining("/auth/confirm") }),
    });
  });

  it("botón Google dispara OAuth google", async () => {
    const user = userEvent.setup();
    render(withI18n(<SignUpForm />));

    await user.click(screen.getByRole("button", { name: /google/i }));

    expect(__mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    const call = (__mockSupabase.auth.signInWithOAuth as any).mock.calls[0][0];
    expect(call.provider).toBe("google");
  });

  it("botón GitHub dispara OAuth github", async () => {
    const user = userEvent.setup();
    render(withI18n(<SignUpForm />));

    await user.click(screen.getByRole("button", { name: /github/i }));

    expect(__mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    const call = (__mockSupabase.auth.signInWithOAuth as any).mock.calls.at(-1)[0];
    expect(call.provider).toBe("github");
  });
});
