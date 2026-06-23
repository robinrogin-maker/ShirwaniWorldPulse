import { createServerFn } from "@tanstack/react-start";
import { runRefreshNews, type RefreshResult } from "./refresh-news.server";

export const refreshNewsFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<RefreshResult> => {
    return runRefreshNews();
  },
);
