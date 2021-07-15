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
    ...aFields
  }

  a2: a {
    ...aFields
  }

  x {
    ...xFields
  }
}

fragment aFields on A {
  b
  c
}

fragment xFields on X {
  b
}
```

```graphql result
query Hello {
  a {
    ...aFields
  }
  a2: a {
    ...aFields
  }
}

fragment aFields on A {
  c
}
```

```json masks
[
  ["a", "b"],
  ["a2", "b"],
  ["x", "b"]
]
```
