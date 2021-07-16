import { expand } from "../src/fragments.js";

test("expand", () => {
  const masks = [
    ["a", "b"],
    ["Fragment:xFields", "b"],
    ["Fragment:aFieldsNested", "b"],
    ["Fragment:aFields", "b"],
  ];

  const map = new Map([
    ["aFields", [["a1"]]],
    [
      "xFields",
      [
        ["a1", "x"],
        ["Fragment:aFieldsNested", "x"],
      ],
    ],
    ["aFieldsNested", [["a2"]]],
  ]);

  expect(expand(masks, map)).toEqual([
    ["a", "b"],
    ["a1", "x", "b"],
    ["a2", "x", "b"],
    ["a2", "b"],
    ["a1", "b"],
  ]);
});
