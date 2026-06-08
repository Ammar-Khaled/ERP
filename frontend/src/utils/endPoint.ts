import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.BACK_END_API_URL}`,
  //   headers: {
  //     token: string;
  //       userId: number;
  //       branchId: number;
  //   }
});

export const signInApi = async ({
  usernameOrEmail,
  password,
}: {
  usernameOrEmail: string;
  password: string;
}) => {
  const res = await api.post("/api/v1/auth/login", {
    usernameOrEmail,
    password,
  });
  return res.data;
};
