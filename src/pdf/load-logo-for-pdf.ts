import logoSidebarUrl from "@/assets/logo.svg?url";
import logoWhiteUrl from "@/assets/logoBranca.svg?url";
import logoPdfUrl from "@/assets/logoPdf.svg?url";

const LOGO_RENDER_WIDTH = 520;

export type PdfLogoVariant = "pdf" | "sidebar" | "white";

export interface LoadedPdfLogo {
  dataUrl: string;
  aspectRatio: number;
}

export async function loadLogoForPdf(
  variant: PdfLogoVariant = "pdf"
): Promise<LoadedPdfLogo> {
  const logoUrl =
    variant === "white"
      ? logoWhiteUrl
      : variant === "sidebar"
        ? logoSidebarUrl
        : logoPdfUrl;
  const response = await fetch(logoUrl);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const aspectRatio = image.height / image.width;
        const canvas = document.createElement("canvas");
        canvas.width = LOGO_RENDER_WIDTH;
        canvas.height = Math.round(LOGO_RENDER_WIDTH * aspectRatio);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Não foi possível renderizar a logo."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          aspectRatio,
        });
      };
      image.onerror = () => reject(new Error("Não foi possível carregar a logo."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
