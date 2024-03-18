import axios, { AxiosResponse } from "axios";

export const apiClientBuilder = () => {
  return {
    async sendREST(baseUrl: string, token: string): Promise<AxiosResponse> {
      return await axios({
        method: "GET",
        url: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    async sendSOAP(baseUrl: string, token: string): Promise<AxiosResponse> {
      return await axios({
        method: "POST",
        url: baseUrl,
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Bearer ${token}`,
        },
      });
    },
  };
};

export type ApiClientHandler = ReturnType<typeof apiClientBuilder>;
