import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/sports")({
  head: () => categoryHead("sports"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("sports")),
  component: () => <CategoryPage categoryKey="sports" />,
  errorComponent: ArticlesError,
});
