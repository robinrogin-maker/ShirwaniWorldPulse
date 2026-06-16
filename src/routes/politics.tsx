import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/politics")({
  head: () => categoryHead("politics"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("politics")),
  component: () => <CategoryPage categoryKey="politics" />,
  errorComponent: ArticlesError,
});
