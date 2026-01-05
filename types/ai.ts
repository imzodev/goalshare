export type AgentPayload =
  | string
  | {
      data?:
        | {
            finalOutput?: unknown;
            text?: string;
            content?: string;
            output?: string;
          }
        | unknown;
    }
  | Record<string, unknown>;
