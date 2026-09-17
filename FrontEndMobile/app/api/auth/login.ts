import { LoginRequest } from "@/types/LoginRequest";
import { client } from "../client";

export const login = async (loginData: LoginRequest) => {
  const { data } = await client.post("/users/login", loginData);
  return data;
};
