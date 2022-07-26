const express = require('express')

const app = express()

const port = 5000

app.get('/', function(request,response){
    response.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Personal Web App listening on port ${port}`)
})