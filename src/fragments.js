export class FragmentTracker {
  #toRemove = new Set();
  /** @type {Map<string, string[][]>} */
  #spreadsToPathParents = new Map();
  #seenPaths = new Set();

  /**
   * @param {string} name
   */
  markForRemoval(name) {
    this.#toRemove.add(name);
  }

  /**
   * @param {string} name
   */
  shouldRemove(name) {
    return this.#toRemove.has(name);
  }

  /**
   * @param {string} name
   */
  markRemoved(name) {
    this.#toRemove.delete(name);
  }

  /**
   * @param {string} spreadName
   * @param {string[]} parents
   * @param {readonly (string | number)[]} path
   */
  recordParentsForSpread(spreadName, parents, path) {
    // ignore locations in the document we've already seen (due to revisits)
    const pathId = path.join(".");
    if (this.#seenPaths.has(pathId)) return;
    this.#seenPaths.add(pathId);

    let existingParentPath = this.#spreadsToPathParents.get(spreadName);

    if (!existingParentPath) {
      existingParentPath = [];
      this.#spreadsToPathParents.set(spreadName, existingParentPath);
    }

    existingParentPath.push(parents);
  }

  /**
   * @param {string[][]} masks
   * @returns {string[][]}
   */
  expandMasks(masks) {
    return expand(masks, this.#spreadsToPathParents);
  }
}

/**
 * Given:
 * - map of fragment names to paths: { foo => [[a, b], [x, y]] }
 * - paths with fragment references in them: [[Fragment:foo. c], [Fragment:foo, z]]
 *
 * Construct new paths replacing the fragment reference with the path to get
 * to that fragment:
 *
 * [
 *  [a, b, c],
 *  [x, y, c],
 *  [a, b, z],
 *  [x, y, z]
 * ]
 *
 * @param {string[][]} masks
 * @param {Map<string, string[][]>} map
 */
export function expand(masks, map) {
  const keys = [...map.keys()];

  /** @type {typeof map} */
  const expandedMap = new Map(keys.map((k) => [k, []]));

  // expand the parents in the map first to avoid having to recurse!

  for (const [fragmentName, parentPaths] of map) {
    for (const parentPath of parentPaths) {
      if (parentPath[0].startsWith("Fragment:")) {
        const name = parentPath[0].slice(9);
        const paths = map.get(name) ?? [];

        for (const path of paths) {
          expandedMap
            .get(fragmentName)
            ?.push([...path, ...parentPath.slice(1)]);
        }
      } else {
        expandedMap.get(fragmentName)?.push(parentPath);
      }
    }
  }

  const expandedMasks = [];

  for (const mask of masks) {
    if (mask[0].startsWith("Fragment:")) {
      const name = mask[0].slice(9);
      const paths = expandedMap.get(name) ?? [];

      for (const path of paths) {
        expandedMasks.push([...path, ...mask.slice(1)]);
      }
    } else {
      expandedMasks.push(mask);
    }
  }

  return expandedMasks;
}
