import axios from "axios";
import { env } from "../config/env";

const api = axios.create({
  baseURL: env.VITE_BACKEND_URL,
});

export const apiClient = api;
