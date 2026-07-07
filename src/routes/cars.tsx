import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/cars")({
  head: () => categoryHead("cars"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("cars")),
  component: () => <CategoryPage categoryKey="cars" />,
  errorComponent: ArticlesError,
});
