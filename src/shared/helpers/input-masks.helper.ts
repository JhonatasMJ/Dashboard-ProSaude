import type { FactoryOpts } from "imask";

export const cnpjMask: FactoryOpts = {
  mask: "00.000.000/0000-00",
};

export const phoneMask: FactoryOpts = {
  mask: [
    { mask: "(00) 0000-0000" },
    { mask: "(00) 00000-0000" },
  ],
};
