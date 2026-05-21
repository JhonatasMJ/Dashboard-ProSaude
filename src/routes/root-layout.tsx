import { Outlet } from "react-router-dom";
import { DocumentTitle } from "@/components/document-title";

export function RootLayout() {
  return (
    <>
      <DocumentTitle />
      <Outlet />
    </>
  );
}
