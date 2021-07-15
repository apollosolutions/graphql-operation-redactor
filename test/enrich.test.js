import { enrich } from "../src/enrich.js";

test("simple", () => {
  const response = {
    data: {
      a: "1",
    },
  };
  const masks = [["b"]];
  const expected = {
    data: {
      a: "1",
      b: null,
    },
  };

  expect(enrich(response, masks, [])).toEqual(expected);
});

test("complex", () => {
  const response = {
    data: {
      a: "1",
      c: [
        {
          x: "2",
        },
        {
          x: "3",
        },
      ],
    },
  };
  const masks = [["b"], ["c", "b"]];
  const expected = {
    data: {
      a: "1",
      b: null,
      c: [
        {
          x: "2",
          b: null,
        },
        {
          x: "3",
          b: null,
        },
      ],
    },
  };

  expect(enrich(response, masks, [])).toEqual(expected);
});

test("deep", () => {
  const response = {
    data: {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: {
                          k: "1",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  const masks = [["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "l"]];
  const expected = {
    data: {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: {
                          k: "1",
                          l: null,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  expect(enrich(response, masks, [])).toEqual(expected);
});
