/**
 * Given a GraphQL response and a list of paths that we redacted from the
 * request operation, add null values for all the scalars that we didn't fetch.
 * @param {import('./typings').Response} response
 * @param {string[][]} masks
 * @param {import("graphql").GraphQLFormattedError[] | undefined} [errors]
 * @returns {import('./typings').Response}
 */
export function enrich(response, masks, errors) {
  if (response.data !== null) {
    for (const mask of masks) {
      addNulls(response.data, mask);
    }
  }

  const newErrors =
    response.errors || errors?.length
      ? /** @type {import("graphql").GraphQLFormattedError[]} */ ([])
          .concat(response.errors ?? [])
          .concat(errors ?? [])
      : undefined;

  return {
    ...response,
    data: response.data,
    ...(newErrors ? { errors: newErrors } : {}),
  };
}

/**
 * @param {any | any[] | null} data
 * @param {string[]} path
 */
function addNulls(data, path) {
  const nextKey = path[0];
  if (nextKey == null) {
    return;
  }

  if (data == null) {
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item) => addNulls(item, path));
  } else if (typeof data === "object") {
    if (path.length === 1) {
      data[nextKey] = null;
    } else {
      addNulls(data[nextKey], path.slice(1));
    }
  }
}
