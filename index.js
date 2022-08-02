const express = require('express')

const db = require('./connection/db')

const app = express()
const port = 5000
const isLogin = true
let blogs = [] // global variable

// Testing connection database
db.connect((err, _, done) => {
    if (err) {
        return console.log(err);
    }
    console.log('Connection Database success');
    done()
})

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
    // Destructuring assignment
    const { title, content, image } = req.body

    db.connect((err, client, done) => {
        if (err) throw err

        const query = `INSERT INTO tb_blog(title, content, image) VALUES ('${title}', '${content}', '${image}');`

        client.query(query, (err) => {
            if (err) throw err
            done()

            res.redirect('/blog')
        })
    })

})

app.get('/form-blog', (req, res) => {
    res.render('form-blog')
})

app.get('/blog', (req, res) => {

    db.connect((err, client, done) => {
        if (err) {
            return console.log(err);
        }

        const query = 'SELECT * FROM tb_blog ORDER BY id DESC'

        client.query(query, (err, result) => {
            if (err) throw err

            const data = result.rows;

            const newBlogs = data.map((blog) => {
                const newBlog = {
                    ...blog,
                    author: `Mr. Jody Septiawan`,
                    time: getFullTime(blog.post_at),
                    isLogin: isLogin
                }
        
                return newBlog
            })

            res.render('blog', { isLogin: isLogin, blogs: newBlogs })
        })
        done()
    })
})

app.get('/blog-detail/:id', (req, res) => {
    const id = req.params.id

    db.connect((err, client, done) => {
        if (err) throw err
        
        const query = `SELECT * FROM tb_blog WHERE id = ${id};`

        client.query(query, (err, result) => {
            if (err) throw err
            done()

            let blog = result.rows[0]

            blog.time = getFullTime(blog.post_at)
            blog.author = 'Jody Septiawan'

            res.render('blog-detail', { blog })
        })
    })
    
})

app.get('/delete-blog/:id', (req,res) => {
    const id = req.params.id // idx == index
    
    db.connect((err, client, done) => {
        if (err) throw err;
        const query = `DELETE FROM tb_blog WHERE id = ${id};`
        client.query(query, (err) => {
            if (err) throw err;
            done()
            res.redirect('/blog')
        })
    })
})

// Not found route custome
app.get('*', (req, res) => {
    res.render('not-found')
})

app.listen(port, () => {
    console.log(`Personal App running on port: ${port}`);
})


function getFullTime(time) {
    let month = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]

    // tanggal => getDate()
    // bulan => getMonth()
    // tahun => getFullYear()
    // jam => getHours()
    // menit => getMinutes()

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()
    let hour = time.getHours()
    let minute = time.getMinutes()

    let result = `${date} ${month[monthIndex]} ${year} ${hour}:${minute} WIB`

    // console.log(time);
    // console.log(result);

    return result;
}