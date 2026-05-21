import { useEffect } from "react";
import { useMatches } from "react-router-dom";
import { APP_NAME } from "@/shared/constants/app.constants";

export type RouteHandle = {
  title?: string;
};

export function DocumentTitle() {
  const matches = useMatches();

  useEffect(() => {
    const match = [...matches]
      .reverse()
      .find((route) => (route.handle as RouteHandle | undefined)?.title);

    const pageTitle = (match?.handle as RouteHandle | undefined)?.title;

    document.title = pageTitle ? `${APP_NAME} | ${pageTitle}` : APP_NAME;
  }, [matches]);

  return null;
}
