---
predicate: notB
---

```graphql schema
type Query {
  a: A
  x: X
}

type A {
  b: String
  c: String
}

type X {
  b: String
}
```

```graphql operation
query Hello {
  a {
    ... on A {
      b
      c
    }
  }

  x {
    ... on X {
      b
    }
  }

  x2: x {
    ... @skip(if: false) {
      b
    }
  }
}
```

```graphql result
query Hello {
  a {
    ... on A {
      c
    }
  }
}
```

```json masks
[
  ["a", "b"],
  ["x", "b"],
  ["x2", "b"]
]
```
