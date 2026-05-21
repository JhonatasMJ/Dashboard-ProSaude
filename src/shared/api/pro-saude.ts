import axios from "axios";
import { addTokenToRequest } from "../helpers/axios.helper";

export const proSaudeApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

addTokenToRequest(proSaudeApi);
