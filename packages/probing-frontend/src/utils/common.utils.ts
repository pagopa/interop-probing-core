/**
 *
 * This is useful when you want to make sure that a promise takes at least a certain amount of time to resolve,
 * for example when you want to avoid flickering of a loading spinner if the promise resolves too quickly.
 */
export async function delayedPromise<TResult>(
  promise: Promise<TResult>,
  delayMs: number
): Promise<TResult> {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, delayMs)),
  ])
  return result
}
