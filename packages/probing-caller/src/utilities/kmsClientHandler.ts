import {
  KMSClient,
  SignCommand,
  SigningAlgorithmSpec,
  SignRequest,
  SignCommandOutput,
} from "@aws-sdk/client-kms";
import { config } from "./config.js";
import { v4 as uuidv4 } from "uuid";
import { callerConstants } from "./constants.js";
import { logger } from "pagopa-interop-probing-commons";
import { buildJWTError } from "../model/domain/errors.js";

interface Claims {
  aud: string[];
  sub: string;
  nbf: number;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
}

export const kmsClientBuilder = () => {
  const kms: KMSClient = new KMSClient();

  return {
    async buildJWT(audience: string[]): Promise<string> {
      try {
        const token = createToken(audience);
        const signReq: SignRequest = {
          KeyId: config.jwtPayloadKidKms,
          Message: Buffer.from(token),
          SigningAlgorithm:
            callerConstants.JWT_SIGNING_ALGORITHM as SigningAlgorithmSpec,
        };

        const signCommand = new SignCommand(signReq);
        const signResult: SignCommandOutput = await kms.send(signCommand);
        const signedTokenBuffer = signResult.Signature;
        if (!signedTokenBuffer) {
          throw new Error("Failed to generate signature.");
        }

        return removePadding(
          `${token}.${Buffer.from(signedTokenBuffer).toString("base64")}`
        );
      } catch (err: unknown) {
        logger.error(`Error building JWT token: ${err}`);
        throw buildJWTError(`${err}`);
      }
    },
  };
};

export type KMSClientHandler = ReturnType<typeof kmsClientBuilder>;

function createToken(audience: string[]): string {
  const header = createHeader();
  const payload = createPayload(audience);

  return `${header}.${payload}`;
}

function createHeader(): string {
  const obj = {
    typ: "at+jwt",
    use: "sig",
    alg: callerConstants.JWT_SIGNING_ALGORITHM,
    kid: config.jwtPayloadKidKms,
  };

  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

function removePadding(base64Text: string): string {
  return base64Text.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function createPayload(audience: string[]): string {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  const claims: Claims = {
    aud: audience,
    sub: config.jwtPayloadSubject,
    nbf: currentTimeInSeconds,
    iss: config.jwtPayloadIssuer,
    exp: Math.floor(Date.now() / 1000 + config.jwtPayloadExpireTimeInSec),
    iat: currentTimeInSeconds,
    jti: uuidv4(),
  };

  return Buffer.from(JSON.stringify(claims)).toString("base64");
}
