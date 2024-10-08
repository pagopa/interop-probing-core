import axios, { AxiosResponse } from "axios";
import { createProbingRequestEnvelope } from "./soapEnvelope.js";
import { AppContext } from "pagopa-interop-probing-commons";

export const apiClientBuilder = () => {
  return {
    async sendREST(
      baseUrl: string,
      token: string,
      ctx: AppContext,
    ): Promise<AxiosResponse> {
      return await axios({
        method: "GET",
        url: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-correlation-id": ctx.correlationId,
        },
      });
    },
    async sendSOAP(
      baseUrl: string,
      token: string,
      ctx: AppContext,
    ): Promise<AxiosResponse> {
      return await axios({
        method: "POST",
        url: baseUrl,
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: `Bearer ${token}`,
          SOAPAction: "interop/probing",
          "x-correlation-id": ctx.correlationId,
        },
        data: createProbingRequestEnvelope(),
      });
    },
  };
};

export type ApiClientHandler = ReturnType<typeof apiClientBuilder>;
