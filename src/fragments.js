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
   * Replace fragment references (`Fragment:foo`) with the possible paths to
   * that fragment.
   *
   * {
   *  foo => [[Fragment:bar, d]],
   *  bar => [[a], [b, c]]
   * }
   *
   * {
   *  foo => [[a, d], [b, c, d]],
   *  bar => [[a], [b, c]]
   * }
   *
   * @returns {Map<string, string[][]>}
   */
  expandFragmentSpreadParentPaths() {
    const fragmentNames = [...this.#spreadsToPathParents.keys()];

    /** @type {Map<string, string[][]>} */
    const exploded = new Map(fragmentNames.map((name) => [name, []]));

    for (const [fragmentName, parentPaths] of this.#spreadsToPathParents) {
      for (const parentPath of parentPaths) {
        const fragmentRefs = parentPath.filter((part) =>
          part.startsWith("Fragment:")
        );

        if (fragmentRefs.length) {
          for (const ref of fragmentRefs) {
            const refName = ref.slice(9);
            const refParentPaths =
              this.#spreadsToPathParents.get(refName) ?? [];

            for (const refParentPath of refParentPaths) {
              const keyIndex = parentPath.indexOf(ref);
              const newMask = parentPath.slice();
              newMask.splice(keyIndex, 1, ...refParentPath);
              exploded.get(fragmentName)?.push(newMask);
            }
          }
        } else {
          exploded.get(fragmentName)?.push(parentPath);
        }
      }
    }

    return exploded;
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
   * @returns {string[][]}
   */
  expandMasks(masks) {
    const exploded = [];

    // Ensure there are no fragment references in parent paths.
    const explodedMap = this.expandFragmentSpreadParentPaths();

    for (const mask of masks) {
      const fragmentRefs = mask.filter((part) => part.startsWith("Fragment:"));

      if (fragmentRefs.length) {
        for (const ref of fragmentRefs) {
          const refName = ref.slice(9);
          const refParentPaths = explodedMap.get(refName) ?? [];

          for (const refParentPath of refParentPaths) {
            const keyIndex = mask.indexOf(ref);
            const newMask = mask.slice();
            newMask.splice(keyIndex, 1, ...refParentPath);
            exploded.push(newMask);
          }
        }
      } else {
        exploded.push(mask);
      }
    }

    return exploded;
  }
}
