import { SignupRequest } from "@/types/SignupRequest";
import { client } from "../client";

export const signup = async (signupData: SignupRequest) => {
  const { data } = await client.post("/users/signup", signupData);
  return data;
};