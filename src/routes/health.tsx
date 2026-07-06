import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

export const Route = createFileRoute("/medicine")({
  head: () => categoryHead("medicine"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("medicine")),
  component: () => <CategoryPage categoryKey="medicine" />,
  errorComponent: ArticlesError,
});
