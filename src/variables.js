export class VariableTracker {
  #used = new Set();
  #maybeRemove = new Set();

  /**
   * @param {import("graphql").FieldNode} f
   */
  forField(f) {
    const names =
      f.arguments
        ?.map((a) => a.value)
        ?.filter(
          /** @type {(v: import("graphql").ValueNode) => v is import("graphql").VariableNode}  */
          (v) => v.kind === "Variable"
        )
        ?.map((v) => v.name.value) ?? [];
    return new Set(names);
  }

  /**
   * @param {Set<string>} set
   */
  markUsed(set) {
    for (const name of set) {
      this.#used.add(name);
    }
  }

  /**
   * @param {Set<string>} set
   */
  markRemoved(set) {
    for (const name of set) {
      this.#maybeRemove.add(name);
    }
  }

  /**
   * @param {readonly import("graphql").VariableDefinitionNode[]} defs
   */
  redactDefinitions(defs) {
    const toRemove = new Set();
    for (const name of this.#maybeRemove) {
      if (!this.#used.has(name)) {
        toRemove.add(name);
      }
    }

    return defs.filter((def) => !toRemove.has(def.variable.name.value));
  }
}
