import type {
  IViaCepAddress,
  IViaCepResponse,
} from "../interfaces/https/viacep";

export const viacepService = {
  async getAddressByCep(cep: string): Promise<IViaCepAddress | null> {
    const digits = cep.replace(/\D/g, "");

    if (digits.length !== 8) {
      return null;
    }

    const response = await fetch(
      `https://viacep.com.br/ws/${digits}/json/`
    );

    if (!response.ok) {
      throw new Error("Não foi possível consultar o CEP.");
    }

    const data = (await response.json()) as IViaCepResponse;

    if (data.erro || !data.logradouro) {
      return null;
    }

    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  },
};
