interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function AIInput({ value, onChange, onSubmit, isLoading }: AIInputProps) {
  return (
    <div className="ic-input-row">
      <input
        className="ic-input"
        placeholder="Ask Inbox Copilot... (e.g., 'find emails from john')"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        disabled={isLoading}
      />
      <button
        className="ic-send"
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? "..." : "Send"}
      </button>
    </div>
  );
}
