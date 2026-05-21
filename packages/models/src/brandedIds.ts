import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const CorrelationId = z.string().uuid().brand("CorrelationId");
export type CorrelationId = z.infer<typeof CorrelationId>;

type IDS = CorrelationId;

// This function is used to generate a new ID for a new object
// it infers the type of the ID based on how is used the result
// the 'as' is used to cast the uuid string to the inferred type
export function generateId<T extends IDS>(): T {
  return uuidv4() as T;
}
