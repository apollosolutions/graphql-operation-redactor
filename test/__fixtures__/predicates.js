/** @type {import("../../src/typings").Predicate<*>} */
export function notB(ctx) {
  return { allowed: !(ctx.field.name === "b") };
}
