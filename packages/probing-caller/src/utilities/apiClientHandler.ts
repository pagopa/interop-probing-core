import axios, { AxiosResponse } from "axios";
import { KMSClientHandler } from "./kmsClientHandler.js";
import { EserviceContentDto } from "../model/models.js";

export const apiClientBuilder = (kmsClientHandler: KMSClientHandler) => {
  return {
    async sendREST(baseUrl: string, eservice: EserviceContentDto): Promise<AxiosResponse> {
      return await axios({
        method: "GET",
        url: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await kmsClientHandler.buildJWT(eservice.basePath)}`,
        },
      });
    },
    async sendSOAP(baseUrl: string, eservice: EserviceContentDto): Promise<AxiosResponse> {
      return await axios({
        method: "POST",
        url: baseUrl,
        headers: {
          "Content-Type": "text/xml",
          Authorization: `Bearer ${await kmsClientHandler.buildJWT(eservice.basePath)}`,
        },
      });
    },
  };
};

export type ApiClientHandler = ReturnType<typeof apiClientBuilder>;