import { useEffect, useState } from "react";

function formatContextLabel(hash: string): string {
  const value = (hash || "#inbox").replace("#", "").replace(/\//g, " ");
  return value.length > 0 ? value : "inbox";
}

export function useGmailContextLabel(): string {
  const [label, setLabel] = useState(() => formatContextLabel(window.location.hash));

  useEffect(() => {
    const updateLabel = (): void => setLabel(formatContextLabel(window.location.hash));

    window.addEventListener("hashchange", updateLabel);
    const timer = window.setInterval(updateLabel, 500);

    return () => {
      window.removeEventListener("hashchange", updateLabel);
      window.clearInterval(timer);
    };
  }, []);

  return label;
}
