interface SearchResultsProps {
  action: string;
  data: unknown;
}

export function SearchResults({ action, data }: SearchResultsProps) {
  if (action !== "search_emails") return null;
  if (!data || !Array.isArray(data)) return null;

  const threads = data as Array<{ id: string; snippet?: string }>;

  return (
    <div style={{ marginTop: "8px" }}>
      {threads.map((thread) => (
        <p key={thread.id} style={{ fontSize: "12px", margin: "4px 0" }}>
          • {thread.snippet ? thread.snippet.substring(0, 100) : thread.id}
        </p>
      ))}
    </div>
  );
}
