import { useState, useRef, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import type { Resource } from "../../types";

const MAX_SUGGESTIONS = 8;

interface WikilinkTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

interface SuggestionState {
  /** Text typed after `[[`, used to filter resources. */
  query: string;
  /** Index in `value` where `[[` starts. */
  startIndex: number;
}

/**
 * A textarea that shows a resource autocomplete dropdown when the user
 * types `[[`. Selecting a suggestion inserts `[[resource title]]`.
 */
export function WikilinkTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "nexus-input resize-y",
}: WikilinkTextareaProps) {
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resources =
    useLiveQuery(() => db.resources.filter((r) => !r.archived).toArray(), []) ?? [];

  const suggestions: Resource[] = suggestion
    ? resources
        .filter((r) =>
          r.title.toLowerCase().includes(suggestion.query.toLowerCase())
        )
        .slice(0, MAX_SUGGESTIONS)
    : [];

  /** Check if cursor sits inside an open `[[...` wikilink. */
  const detectWikilink = useCallback(
    (text: string, cursorPos: number): SuggestionState | null => {
      const textBefore = text.slice(0, cursorPos);
      const lastOpen = textBefore.lastIndexOf("[[");
      if (lastOpen === -1) return null;

      const afterOpen = textBefore.slice(lastOpen + 2);
      // If already closed or crosses a line boundary, no active wikilink.
      if (afterOpen.includes("]]") || afterOpen.includes("\n")) return null;

      return { query: afterOpen, startIndex: lastOpen };
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);

    const detected = detectWikilink(newValue, cursorPos);
    setSuggestion(detected);
    setActiveIndex(0);
  };

  const selectSuggestion = useCallback(
    (resource: Resource) => {
      if (!suggestion) return;
      const before = value.slice(0, suggestion.startIndex);
      // Skip over the `[[` (2 chars) plus the partial query the user typed.
      const after = value.slice(suggestion.startIndex + 2 + suggestion.query.length);
      const newValue = `${before}[[${resource.title}]]${after}`;
      onChange(newValue);
      setSuggestion(null);

      // Restore focus and position cursor just after the inserted `]]`.
      setTimeout(() => {
        if (textareaRef.current) {
          const pos = before.length + resource.title.length + 4; // [[ + title + ]]
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(pos, pos);
        }
      }, 0);
    },
    [suggestion, value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!suggestion || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setSuggestion(null);
    }
  };

  /** Re-evaluate on cursor movement (click / arrow keys outside the list). */
  const handleSelect = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const detected = detectWikilink(value, cursorPos);
    setSuggestion(detected);
    if (!detected) setActiveIndex(0);
  };

  // Close dropdown when clicking outside the wrapper.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSuggestion(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onClick={handleSelect}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />

      {suggestion !== null && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg border shadow-xl z-50 max-h-48 overflow-y-auto"
          style={{
            top: "100%",
            background: "var(--color-nexus-surface)",
            borderColor: "var(--color-nexus-border)",
          }}
        >
          {suggestions.map((resource, i) => (
            <button
              key={resource.id}
              onMouseDown={(e) => {
                // Use onMouseDown so the textarea doesn't lose focus before we
                // read `suggestion` state.
                e.preventDefault();
                selectSuggestion(resource);
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
              style={{
                color: "var(--color-nexus-text)",
                background:
                  i === activeIndex
                    ? "var(--color-nexus-surface-hover)"
                    : "transparent",
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span
                className="text-xs font-mono shrink-0"
                style={{ color: "var(--color-nexus-accent)" }}
              >
                [[
              </span>
              <span className="flex-1 truncate">{resource.title}</span>
              <span
                className="text-xs font-mono shrink-0"
                style={{ color: "var(--color-nexus-accent)" }}
              >
                ]]
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
