import { useEffect, useState } from "react";

/** True while the viewport is at least `px` wide. */
export function useMinWidth(px: number): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= px,
  );

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${px}px)`);
    const onChange = () => setMatches(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [px]);

  return matches;
}
