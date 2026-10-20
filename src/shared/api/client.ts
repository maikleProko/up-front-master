import axios from "axios";
import { apiConfig } from "./config";

export const client = axios.create(apiConfig);
