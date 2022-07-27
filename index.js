const express = require('express')

const app = express()

const port = 5000

const isLogin = true

app.set('view engine', 'hbs')

app.use('/public', express.static(__dirname + '/public'))

app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

app.post('/form-blog', (req, res) => {
    const data = req.body
    console.log(data);

    res.redirect('/blog')
})

app.get('/form-blog', (req, res) => {
    res.render('form-blog')
})

app.get('/blog', (req, res) => {
    res.render('blog', { isLogin: isLogin })
})

app.get('/blog-detail/:index', (req, res) => {
    const index = req.params.index
    console.log(index);
    res.render('blog-detail')
})


// Not found route custome
app.get('*', (req, res) => {
    res.render('not-found')
})

app.listen(port, () => {
    console.log(`Personal App running on port: ${port}`);
})