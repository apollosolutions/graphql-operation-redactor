---
predicate: notB
---

```graphql schema
type Query {
  a: A
}

type A {
  b: String
  c: String
  x: X
}

type X {
  b: String
}
```

```graphql operation
query Hello {
  a {
    b
    c
  }

  a1: a {
    ...aFields
    x {
      ...xFields
    }
  }

  a2: a {
    ...aFieldsNested
  }
}

fragment xFields on X {
  b
}

fragment aFieldsNested on A {
  b
  c
  x {
    ...xFields
  }
}

fragment aFields on A {
  b
  c
}
```

```graphql result
query Hello {
  a {
    c
  }
  a1: a {
    ...aFields
  }
  a2: a {
    ...aFieldsNested
  }
}

fragment aFieldsNested on A {
  c
}

fragment aFields on A {
  c
}
```

```json masks
[
  ["a", "b"],
  ["a1", "x", "b"],
  ["a2", "x", "b"],
  ["a2", "b"],
  ["a1", "b"]
]
```
