---
predicate: notB
---

```graphql schema
type Query {
  a: String!
  b: String!
  c: C!
}

type C {
  b: String
}
```

```graphql operation
query Hello {
  a
  b
  c {
    b
  }
}
```

```json error
{
  "message": "Non-null field Query.b removed from operation Hello",
  "locations": [
    {
      "line": 3,
      "column": 3
    }
  ],
  "path": ["b"],
  "extensions": {
    "code": "REDACT_NON_NULL"
  }
}
```

```json error
{
  "message": "Non-null field Query.c removed from operation Hello",
  "locations": [
    {
      "line": 4,
      "column": 3
    }
  ],
  "path": ["c"],
  "extensions": {
    "code": "REDACT_NON_NULL"
  }
}
```

```json masks
[["b"], ["c", "b"]]
```
