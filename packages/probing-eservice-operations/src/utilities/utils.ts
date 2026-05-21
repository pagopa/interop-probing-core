// Safe JSON stringify that converts BigInt to string to avoid serialization errors
export function safeStringify(value: unknown) {
  return JSON.stringify(value, (_key, val) =>
    typeof val === "bigint" ? val.toString() : val,
  );
}
