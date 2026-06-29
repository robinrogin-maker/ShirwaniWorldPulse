import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/tourism")({
  head: () => categoryHead("tourism"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("tourism")),
  component: () => <CategoryPage categoryKey="tourism" />,
  errorComponent: ArticlesError,
});
