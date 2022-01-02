const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Ususario')
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")
//gsdgsdg@gdfgdf.com


router.get("/signin", (req, res) => {
    res.render("usuarios/signin")
})

router.post("/signin", (req, res) => {
    erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"})
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Email inválido"})
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha inválido"})
    }

    if (req.body.senha.length < 6) {
        erros.push({texto: "Senha muito curta"})
    }

    if (req.body.senha2 != req.body.senha) {
        erros.push({texto: "Senhas diferentes"})
    }

    if(erros.length > 0){
        res.render("usuarios/signin", {erros: erros})
    }else{

        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Email já cadastrado")
                res.redirect("/usuarios/signin")
            }else{
                const novoUsuario = {
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                }
        
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Ocorreu um erro ao salval o usuario")
                            res.redirect("/")
                        }
        
                        novoUsuario.senha = hash
        
                        new Usuario(novoUsuario).save().then(() => {
                            req.flash("success_msg", "Usuario cadastrado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao cadastrar usuario")
                            res.redirect("/usuarios/signin")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro interno"+err)
            res.redirect("/usuarios/signin")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logOut()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})






module.exports = router