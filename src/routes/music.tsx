import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";

export const Route = createFileRoute("/music")({
  head: () => categoryHead("music"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("music")),
  component: () => <CategoryPage categoryKey="music" />,
});
