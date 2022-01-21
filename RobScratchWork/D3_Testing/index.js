const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send("Hello World! You're at the root path, go to a sub-item via its filename in the Public dir, ex. `/lineplot.html`")
})

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})