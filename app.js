//Carregando modulos
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const admin = require('./routes/admin')
    const path = require("path")
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Post")
    const Post = mongoose.model("posts")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuarios")
    const passport = require("passport")
    require("./config/auth")(passport)
    /*require("./models/Ususario")
    const Ususario = mongoose.model("usuarios")*/
    


//Configuração Session
    app.use(session({
        secret: "blogapp",
        resave: true,
        saveUninitialized: true
    }))
//Para usar o passport
    app.use(passport.initialize())
    app.use(passport.session())
//Para usar flash
    app.use(flash())
//Configuração Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })
//Configuração handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

//Configuração Body-Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

//Configurando mongoose
    mongoose.connect("mongodb://localhost/bogapp").then(() => {
        console.log("Bando de dados conectado")
    }).catch((err) =>{
        console.log("Erro ao conectra com o banco de dados"+err)
    })





//Public - Arquivos staticos
    app.use(express. static(path.join(__dirname, "public")))

    app.use((req, res, next) => {
        console.log("MIDDLEWARE")
        next()
    })





//Rotas

    app.get('/', (req, res) => {
        Post.find().populate("categoria").lean().then((posts) => {
            res.render("index", {posts: posts})
        }).catch((err) => {
            req.flash("error_msg", "Erro ao exibir postagens")
            res.redirect("/404")
        })
    })

    app.get("/404", (req, res) => {
        res.send("ERRO 404")
    })

    app.get("/postagem/:slug", (req, res) => {
        Post.findOne({slug: req.params.slug}).lean().then((posts) => {
            res.render("postagem/leiapostagem", {posts: posts})
        }).catch((err) => {
            req.flash("error_msg", "Postagem não encontrada")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((cates) => {
            res.render("categorias/vercategorias", {cates: cates})
        }).catch((err) => {
            req.flash('error_msg', "Falha carregar categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((cates) => {
            if (cates) {
                Post.find({categoria: cates._id}).lean().then((posts) => {
                    res.render("categorias/verpostagens", {posts: posts, cates: cates})
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao listar as postagens")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Falha ao carregar categorias")
            res.redirect("/")
        })
    })



    app.use('/admin', admin)
    app.use("/usuarios", usuarios)



//Definindo porta do servidor 
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor rodando!')
})