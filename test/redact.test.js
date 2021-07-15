import { print, validate } from "graphql";
import { redact } from "../src/redact.js";
import { parseFixture } from "./utils.js";
import walkSync from "walk-sync";
import { basename } from "path";

const fixtures = walkSync("test/__fixtures__", { globs: ["*.md"] });

for (const fixture of fixtures) {
  test(basename(fixture, ".md"), async () => {
    const { input, output } = await parseFixture(
      `test/__fixtures__/${fixture}`
    );

    const result = redact(input.operation, input.schema, {}, input.predicate);

    if (result.ok) {
      expect(print(result.operation)).toEqual(output.operation);

      expect(result.masks).toEqual(output.masks);

      expect(validate(input.schema, result.operation));
    } else {
      expect(JSON.parse(JSON.stringify(result.errors))).toEqual(
        Array.isArray(output.error) ? output.error : [output.error]
      );

      expect(result.masks).toEqual(output.masks);
    }
  });
}
