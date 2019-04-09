'use strict';

const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./controllers/User');
const Store = require('./controllers/Store');
const Order = require('./controllers/Order');

// passport use the local strategy
passport.use('local', new LocalStrategy(
	{usernameField: 'email'},
	(email, password, done) => {
		User.loginUser(email, password)
			.then(function (user) {
				done(null, user[0]);
			}).catch(function (response) {
			done(response);
		});
	}
));

passport.serializeUser((user, done) => {
	done(null, user.id_user);
});

passport.deserializeUser((id, done) => {
	User.findById(id, function (err, user) {
		if (err) {
			done(err, false);
		} else {
			done(null, user);
		}
	});
});

const app = express();

// add & configure middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
	genid: () => {
		return uuid();
	},
	store: new FileStore(),
	secret: 'Yb1IyYjEEdY0hNTkCevK',
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// router
app.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		res.json(`Olá, ${req.user.name}!`);
	} else {
		res.json('Seja bem-vindo à Locadora!');
	}
});
app.use('/user', User);
app.use('/store', Store);
app.use('/order', Order);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Servidor escutando na porta ${PORT}!`);
});

module.exports = app;
