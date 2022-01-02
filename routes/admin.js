const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model("categorias")
require("../models/Post")
const Post = mongoose.model("posts")
const {isAdmin } = require("../helpers/isAdmin")



router.get('/', isAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/cates', isAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar as categorias")
        res.redirect("/admin")
    })
    
})

router.post('/cates/nova', isAdmin, (req, res) => {
    
    let erros = []

    if (!req.body.nome || !req.body.slug) {
        //array.push() adiciona um elemento no array
        erros.push({texto: "Preencha todos os campos abaixo"})
    }

    if (req.body.nome.length < 2) {
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", {erros: erros})
        //console.log(erros.length)
    }else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria adicionada com sucesso")
            res.redirect("/admin/cates")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao adicionar categoria")
        })
    }
})

router.get('/cates/add', isAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.get('/cates/edit/:id', isAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect('/admin/cates')
    })
})

router.post('/cates/edit', isAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/cates")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria")
            res.redirect("/admin/cates")
        })
    }).catch((err) => {
        req.flash("error_msg", "Categoria não encontrada")
        res.redirect("/admin/cates")
    })
})

router.post("/cates/delete", isAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/cates")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria")
        res.redirect("/admin/cates")
    })
})

router.get("/posts", isAdmin, (req, res) => {
    //Uso do populate para listar as postagenss
    Post.find().lean().populate("categoria").sort({data: "desc"}).then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens")
        res.redirect("/admin")
    })

    /*Post.find().lean().then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens")
        res.redirect("/admin")
    })*/
})

router.get("/posts/add", isAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpost", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Falha ao cadastrar postagem")
    })
})

router.post("/posts/novo", isAdmin, (req, res) => {
    let erros = []

    if (req.body.categoria == "0") {
        erros.push({texto: "Adicione uma categoria"})
    }

    if (erros.length > 0) {
        res.render("admin/posts", {erros: erros})
    }else{
        const novoPost = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Post(novoPost).save().then(() => {
            req.flash("success_msg", "Postagem salva com sucesso")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao cadastrar postagem")
            res.redirect("/admin/posts")
        })
    }
})

router.get('/posts/edit/:id', isAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then((post) => {
        Categoria.find().lean().then((categoria) => {
            res.render("admin/editpostagens", {categoria: categoria, post: post})
        }).catch((err) => {
            req.flash("error_msg", "Erro na listagem de categorias")
            res.redirect("/admin/posts")
        })
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe")
        res.redirect('/admin/cates')
    })
})

router.post('/posts/edit', isAdmin, (req, res) => {
    Post.findOne({_id: req.body.id}).then((post) => {
        post.titulo = req.body.titulo
        post.slug = req.body.slug
        post.descricao = req.body.descricao
        post.conteudo = req.body.conteudo
        post.categoria = req.body.categoria


        post.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/posts")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro ao editar postagem")
            res.redirect("/admin/posts")
        })
    }).catch((err) => {
        req.flash("error_msg", "Postagem não encontrada")
        res.redirect("/admin/posts")    
    })
})

router.post("/posts/delete", isAdmin, (req, res) => {
    Post.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/posts")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar postagem")
        res.redirect("/admin/posts")
    })
})

module.exports = router