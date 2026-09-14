import { client } from "../client";

export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await client.post("/users/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return typeof data === "string" ? data : data.imageUrl;
};
