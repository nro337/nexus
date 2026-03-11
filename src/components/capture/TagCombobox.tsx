import { useState, useRef, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { createTag } from "../../db/tags";
import type { Tag } from "../../types";

interface TagComboboxProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagCombobox({ selectedTagIds, onChange }: TagComboboxProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const allTags = useLiveQuery(() => db.tags.orderBy("name").toArray(), []) ?? [];
  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

  const filtered = allTags.filter(
    (t) =>
      t.name.includes(input.toLowerCase()) && !selectedTagIds.includes(t.id)
  );

  const showCreateOption =
    input.trim() &&
    !allTags.some((t) => t.name === input.trim().toLowerCase());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: Tag) => {
    onChange([...selectedTagIds, tag.id]);
    setInput("");
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!input.trim()) return;
    const tag = await createTag({ name: input.trim(), color: "" });
    addTag(tag);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && showCreateOption) {
      e.preventDefault();
      handleCreateTag();
    }
    if (e.key === "Backspace" && !input && selectedTagIds.length) {
      removeTag(selectedTagIds[selectedTagIds.length - 1]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="nexus-input flex flex-wrap gap-1.5 min-h-[38px] cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="nexus-tag"
            style={{ borderColor: tag.color, color: tag.color }}
          >
            {tag.name}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(tag.id); }}
              className="ml-0.5 hover:opacity-70"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length ? "" : "Add tags..."}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
          style={{ color: "var(--color-nexus-text)" }}
        />
      </div>

      {isOpen && (filtered.length > 0 || showCreateOption) && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-xl z-50 max-h-48 overflow-y-auto"
          style={{ background: "var(--color-nexus-surface)", borderColor: "var(--color-nexus-border)" }}
        >
          {filtered.map((tag) => (
            <button
              key={tag.id}
              onClick={() => addTag(tag)}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
              style={{ color: "var(--color-nexus-text)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-nexus-surface-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: tag.color }} />
              {tag.name}
            </button>
          ))}
          {showCreateOption && (
            <button
              onClick={handleCreateTag}
              className="w-full px-3 py-2 text-left text-sm transition-colors"
              style={{ color: "var(--color-nexus-accent)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-nexus-surface-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              + Create "{input.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
