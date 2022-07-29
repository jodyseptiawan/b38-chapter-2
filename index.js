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
    const data = req.body

    data.author = 'Jody Septiawan'
    data.postAt = new Date()

    console.log(data);


    if(data.checkbox) {
        data.checkbox = true
    }else {
        data.checkbox = false
    }


    blogs.push(data)

    res.redirect('/blog')
})

app.get('/form-blog', (req, res) => {
    res.render('form-blog')
})

app.get('/blog', (req, res) => {

    db.connect((err, client, done) => {
        if (err) {
            return console.log(err);
        }

        const query = 'SELECT * FROM tb_blog'

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

app.get('/blog-detail/:index', (req, res) => {
    const index = req.params.index
    
    const blog = blogs[index]

    const newBlog = {
        ...blog,
        author: `Mr. ${blog.author}`,
        time: getFullTime(blog.postAt),
        isLogin: isLogin
    }

    console.log(newBlog);

    res.render('blog-detail', { blog: newBlog })
})

app.get('/delete-blog/:idx', (req,res) => {
    const idx = req.params.idx // idx == index

    blogs.splice(idx,1)

    res.redirect('/blog')
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