import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/economy")({
  head: () => categoryHead("economy"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("economy")),
  component: () => <CategoryPage categoryKey="economy" />,
  errorComponent: ArticlesError,
});
