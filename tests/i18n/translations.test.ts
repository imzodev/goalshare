/**
 * Tests for i18n translations
 * Validates that all translation keys exist in both languages
 */

import { describe, it, expect } from "vitest";
import esMessages from "@/i18n/messages/es.json";
import enMessages from "@/i18n/messages/en.json";

describe("i18n Translations", () => {
  describe("Message files structure", () => {
    it("should have both ES and EN message files", () => {
      expect(esMessages).toBeDefined();
      expect(enMessages).toBeDefined();
    });

    it("should have the same top-level keys in both languages", () => {
      const esKeys = Object.keys(esMessages).sort();
      const enKeys = Object.keys(enMessages).sort();

      expect(esKeys).toEqual(enKeys);
    });
  });

  describe("Common namespace", () => {
    it("should have common.actions keys in both languages", () => {
      expect(esMessages.common.actions).toBeDefined();
      expect(enMessages.common.actions).toBeDefined();

      const esKeys = Object.keys(esMessages.common.actions).sort();
      const enKeys = Object.keys(enMessages.common.actions).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have common.states keys in both languages", () => {
      expect(esMessages.common.states).toBeDefined();
      expect(enMessages.common.states).toBeDefined();

      const esKeys = Object.keys(esMessages.common.states).sort();
      const enKeys = Object.keys(enMessages.common.states).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have common.time keys in both languages", () => {
      expect(esMessages.common.time).toBeDefined();
      expect(enMessages.common.time).toBeDefined();

      const esKeys = Object.keys(esMessages.common.time).sort();
      const enKeys = Object.keys(enMessages.common.time).sort();

      expect(esKeys).toEqual(enKeys);
    });
  });

  describe("Goals namespace", () => {
    it("should have goals.types keys in both languages", () => {
      expect(esMessages.goals.types).toBeDefined();
      expect(enMessages.goals.types).toBeDefined();

      const esKeys = Object.keys(esMessages.goals.types).sort();
      const enKeys = Object.keys(enMessages.goals.types).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have goals.status keys in both languages", () => {
      expect(esMessages.goals.status).toBeDefined();
      expect(enMessages.goals.status).toBeDefined();

      const esKeys = Object.keys(esMessages.goals.status).sort();
      const enKeys = Object.keys(enMessages.goals.status).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have goals.create keys in both languages", () => {
      expect(esMessages.goals.create).toBeDefined();
      expect(enMessages.goals.create).toBeDefined();

      const esKeys = Object.keys(esMessages.goals.create).sort();
      const enKeys = Object.keys(enMessages.goals.create).sort();

      expect(esKeys).toEqual(enKeys);
    });
  });

  describe("Dashboard namespace", () => {
    it("should have dashboard.header keys in both languages", () => {
      expect(esMessages.dashboard.header).toBeDefined();
      expect(enMessages.dashboard.header).toBeDefined();

      const esKeys = Object.keys(esMessages.dashboard.header).sort();
      const enKeys = Object.keys(enMessages.dashboard.header).sort();

      expect(esKeys).toEqual(enKeys);
    });
  });

  describe("Secondary pages", () => {
    it("should have notifications keys in both languages", () => {
      expect(esMessages.notifications).toBeDefined();
      expect(enMessages.notifications).toBeDefined();

      const esKeys = Object.keys(esMessages.notifications).sort();
      const enKeys = Object.keys(enMessages.notifications).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have progress keys in both languages", () => {
      expect(esMessages.progress).toBeDefined();
      expect(enMessages.progress).toBeDefined();

      const esKeys = Object.keys(esMessages.progress).sort();
      const enKeys = Object.keys(enMessages.progress).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have achievements keys in both languages", () => {
      expect(esMessages.achievements).toBeDefined();
      expect(enMessages.achievements).toBeDefined();

      const esKeys = Object.keys(esMessages.achievements).sort();
      const enKeys = Object.keys(enMessages.achievements).sort();

      expect(esKeys).toEqual(enKeys);
    });

    it("should have calendar keys in both languages", () => {
      expect(esMessages.calendar).toBeDefined();
      expect(enMessages.calendar).toBeDefined();

      const esKeys = Object.keys(esMessages.calendar).sort();
      const enKeys = Object.keys(enMessages.calendar).sort();

      expect(esKeys).toEqual(enKeys);
    });
  });

  describe("Translation completeness", () => {
    it("should not have empty strings in ES messages", () => {
      const checkEmpty = (obj: any, path = ""): string[] => {
        const emptyKeys: string[] = [];

        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === "string") {
            if (value.trim() === "") {
              emptyKeys.push(currentPath);
            }
          } else if (typeof value === "object" && value !== null) {
            emptyKeys.push(...checkEmpty(value, currentPath));
          }
        }

        return emptyKeys;
      };

      const emptyKeys = checkEmpty(esMessages);
      expect(emptyKeys).toEqual([]);
    });

    it("should not have empty strings in EN messages", () => {
      const checkEmpty = (obj: any, path = ""): string[] => {
        const emptyKeys: string[] = [];

        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === "string") {
            if (value.trim() === "") {
              emptyKeys.push(currentPath);
            }
          } else if (typeof value === "object" && value !== null) {
            emptyKeys.push(...checkEmpty(value, currentPath));
          }
        }

        return emptyKeys;
      };

      const emptyKeys = checkEmpty(enMessages);
      expect(emptyKeys).toEqual([]);
    });
  });
});
