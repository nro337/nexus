import { useSearchStore } from "../store/useSearchStore";
import { ResourceList } from "../components/resources/ResourceList";
import { SearchResults } from "../components/search/SearchResults";

export function ResourcesPage() {
  const { query } = useSearchStore();

  if (query.trim()) {
    return <SearchResults />;
  }

  return (
    <div className="max-w-4xl">
      <ResourceList />
    </div>
  );
}
