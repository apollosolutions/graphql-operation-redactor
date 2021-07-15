---
predicate: notB
---

```graphql schema
type Query {
  a(arg: String): String
  b(arg: String): String
  c(arg: String): String
}
```

```graphql operation
query Hello($a: String, $b: String, $c: String) {
  a(arg: $a)
  x: b(arg: $b)
  y: b(arg: $c)
  c(arg: $c)
}
```

```graphql result
query Hello($a: String, $c: String) {
  a(arg: $a)
  c(arg: $c)
}
```

```json masks
[["x"], ["y"]]
```
