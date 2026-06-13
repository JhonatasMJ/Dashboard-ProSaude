import { Outlet } from "react-router-dom";
import { DocumentTitle } from "@/components/DocumentTitle";

export function RootLayout() {
  return (
    <>
      <DocumentTitle />
      <Outlet />
    </>
  );
}
