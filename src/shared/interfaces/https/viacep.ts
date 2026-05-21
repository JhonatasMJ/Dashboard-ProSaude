export interface IViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface IViaCepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}
