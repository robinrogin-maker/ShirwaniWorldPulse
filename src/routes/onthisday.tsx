import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/onthisday")({
  head: () => categoryHead("onthisday"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("onthisday")),
  component: () => <CategoryPage categoryKey="onthisday" />,
  errorComponent: ArticlesError,
});
