import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/shopping")({
  head: () => categoryHead("shopping"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("shopping")),
  component: () => <CategoryPage categoryKey="shopping" />,
  errorComponent: ArticlesError,
});
