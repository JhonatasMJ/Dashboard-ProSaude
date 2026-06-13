import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AuthProvider } from "@/contexts/auth.context";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </AuthProvider>
  );
}
