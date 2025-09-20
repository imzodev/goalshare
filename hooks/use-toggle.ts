import { useCallback, useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState<boolean>(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  return { value, toggle, on, off, set: setValue } as const;
}
