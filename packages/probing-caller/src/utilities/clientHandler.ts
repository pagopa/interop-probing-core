import axios, { AxiosResponse } from "axios";

export const clientBuilder = () => {
  return {
    async sendREST(baseUrl: string): Promise<AxiosResponse> {
      return await axios({
        method: "GET",
        url: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${"getKmsJWT"}`,
        },
      });
    },
    async sendSOAP(baseUrl: string): Promise<AxiosResponse> {
      return await axios({
        method: "POST",
        url: baseUrl,
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Bearer ${"getKmsJWT"}`,
        },
      });
    },
  };
};

export type ClientHandler = ReturnType<typeof clientBuilder>;