import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/weather")({
  head: () => categoryHead("weather"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("weather")),
  component: () => <CategoryPage categoryKey="weather" />,
  errorComponent: ArticlesError,
});
