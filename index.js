const express = require('express')
const bcrypt = require('bcrypt');
const session = require('express-session')
const flash = require('express-flash')

const db = require('./connection/db')

const app = express()
const port = 5000
const isLogin = true
let blogs = [] // global variable

app.use(flash())

app.use(session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }
}))

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

    const user_id = req.session.user.id

    db.connect((err, client, done) => {
        if (err) throw err

        const query = `INSERT INTO tb_blog(title, content, image, author_id) VALUES ('${title}', '${content}', '${image}', '${user_id}');`

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

    // console.log(req.session);

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
                    isLogin: req.session.isLogin
                }
        
                return newBlog
            })

            res.render('blog', { user: req.session.user, isLogin: req.session.isLogin, blogs: newBlogs })
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

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    const hashPassword = bcrypt.hashSync(password, 10)


    db.connect((err, client, done) => {
        if (err) throw err

        const query = `INSERT INTO tb_user(name, email, password) VALUES ('${name}', '${email}', '${hashPassword}');`
        client.query(query, (err) => {
            if (err) throw err
        })
        
        done()
        req.flash('success', `Email: <b>${email}</b> has been register ✅`)
        res.redirect('/login')
    })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    const { email, password } = req.body

    if (email == '' || password == '') {
        req.flash('warning', 'Please insert all fields')
        return res.redirect('/login')
    }

    db.connect((err, client, done) => {
        if (err) throw err

        const query = `SELECT * FROM tb_user WHERE email = '${email}'`

        client.query(query, (err, result) => {
            if (err) throw err

            const data = result.rows

            // Check email
            if (data.length == 0) {
                req.flash('error', `Email: <b>${email}</b> not found ❌`)
                return res.redirect('/login')
            }

            // Check Password
            const isMatch = bcrypt.compareSync(password, data[0].password)

            if (isMatch == false) {
                req.flash('error', `Password Wrong! ❌`)
                return res.redirect('/login')
            }

            // Store data to session
            req.session.isLogin = true
            req.session.user = {
                id: data[0].id,
                email: data[0].email,
                name: data[0].name
            }

            res.redirect('/blog')
        })
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy()
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