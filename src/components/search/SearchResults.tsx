import { useTranslation } from "react-i18next";
import { useSearchStore } from "../../store/useSearchStore";
import { ResourceCard } from "../resources/ResourceCard";

export function SearchResults() {
  const { t } = useTranslation();
  const { query, results, isSearching } = useSearchStore();

  if (!query.trim()) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: "var(--color-nexus-text)" }}>
          {t("search.results")}: "{query}"
        </h3>
        <span className="text-xs" style={{ color: "var(--color-nexus-text-muted)" }}>
          {isSearching ? t("search.searching") : `${results.length} found`}
        </span>
      </div>

      {results.length === 0 && !isSearching ? (
        <p className="text-sm py-8 text-center" style={{ color: "var(--color-nexus-text-muted)" }}>
          {t("search.noResults")} "{query}".
        </p>
      ) : (
        <div className="space-y-2">
          {results.map((result) => (
            <ResourceCard key={result.resource.id} resource={result.resource} />
          ))}
        </div>
      )}
    </div>
  );
}
