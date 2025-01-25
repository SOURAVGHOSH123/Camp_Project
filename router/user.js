const express = require('express')
const router = express.Router();
const User = require('../models/user')
const passport = require('passport')
const AsyncCatchError = require('../utils/AsyncCatchError')
const { storeReturnTo } = require('../middleware');
const users = require('../controller/user');

router.route('/register')
   .get(users.renderRegister)
   .post(AsyncCatchError(users.register))

// router.get('/register', users.renderRegister)

// router.post('/register', AsyncCatchError(users.register))

router.route('/login')
   .get(users.renderLogin)
   .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// router.get('/login', users.renderLogin)

// router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;