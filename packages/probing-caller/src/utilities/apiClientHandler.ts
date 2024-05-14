import axios, { AxiosResponse } from "axios";
import { createProbingRequestEnvelope } from "./soapEnvelope.js";

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
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: `Bearer ${token}`,
          SOAPAction: "interop/probing",
        },
        data: createProbingRequestEnvelope(),
      });
    },
  };
};

export type ApiClientHandler = ReturnType<typeof apiClientBuilder>;
