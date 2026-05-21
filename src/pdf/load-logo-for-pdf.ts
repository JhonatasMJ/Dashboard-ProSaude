import logoUrl from "@/assets/logo.svg?url";

const LOGO_RENDER_WIDTH = 520;

export async function loadLogoForPdf(): Promise<string> {
  const response = await fetch(logoUrl);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const aspect = image.height / image.width;
        const canvas = document.createElement("canvas");
        canvas.width = LOGO_RENDER_WIDTH;
        canvas.height = Math.round(LOGO_RENDER_WIDTH * aspect);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Não foi possível renderizar a logo."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Não foi possível carregar a logo."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
