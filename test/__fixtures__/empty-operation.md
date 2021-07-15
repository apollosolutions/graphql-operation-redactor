---
predicate: notB
---

```graphql schema
type Query {
  a: A
}

type A {
  x: X
}

type X {
  b: String
}
```

```graphql operation
query Hello {
  a {
    x {
      b
    }
  }
}
```

```json error
{
  "message": "All fields removed from operation Hello",
  "locations": [
    {
      "line": 1,
      "column": 1
    }
  ],
  "extensions": {
    "code": "REDACT_EMPTY_OPERATION"
  }
}
```

```json masks
[["a", "x", "b"]]
```
