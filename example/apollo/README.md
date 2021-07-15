# Apollo Server example

**⚠️ Warning ⚠️** The plugin in this example uses private APIs to mutate the
request and response. This may not be supported in the future.

## Run it

```sh
yarn
yarn start
```

## Test it

```
ADMIN_JWT=eyJhbGciOiJFUzI1NiJ9.eyJzY29wZSI6WyJjdXN0b21lcnM6cmVhZCIsImN1c3RvbWVyczpyZWFkOnBpaSJdLCJpYXQiOjE2MjYzNjU0NzAsImlzcyI6InVybjpleGFtcGxlOmlzc3VlciIsImF1ZCI6InVybjpleGFtcGxlOmF1ZGllbmNlIn0.skMg5Bdsnw_PCOcxvEgnNRwY7IB7yxxRW_HpQagSt9Uj8z_LnqhAnHoDP8gmTizyOjLug-Q0FkeBw6JoG0IcbA

UNSCOPED_JWT=eyJhbGciOiJFUzI1NiJ9.eyJzY29wZSI6WyJjdXN0b21lcnM6cmVhZCJdLCJpYXQiOjE2MjYzNjUyMzgsImlzcyI6InVybjpleGFtcGxlOmlzc3VlciIsImF1ZCI6InVybjpleGFtcGxlOmF1ZGllbmNlIn0.vM_n36ZJrBNgMdVQ25bCq_y5UNDmh8ZxX8OvwcVd81CNxRJ5l_wz4bFSPY507IC-UyY7IK-tNubXLBqKJfhbwg

QUERY='{ "query": "query Customer($id: ID!) { customer(id: $id) { id name emailAddress } }", "variables": {"id": "1"} }'

curl http://localhost:4000/ \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H 'Content-Type: application/json' \
  -d $QUERY

curl http://localhost:4000/ \
  -H "Authorization: Bearer $UNSCOPED_JWT" \
  -H 'Content-Type: application/json' \
  -d $QUERY
```

### Expected Output

```json
{"data":{"customer":{"id":"1","name":"Morty Smith","emailAddress":"morty@example.com"}}}
{"data":{"customer":{"id":"1","name":"Morty Smith","emailAddress":null}}}
```
