'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils/writer.js');
const passport = require('passport');
const {check, validationResult} = require('express-validator/check');
const User = require('../service/UserService');

module.exports = router;
module.exports.index = (req, res, next) => {
	const err = validationResult(req);

	if (!err.isEmpty()) {
		const errors = err.array()[0];

		switch (errors.param) {
			case 'name':
				utils.writeJson(res, new utils.respondWithCode(401, {'message': 'O nome deve possuir no mínimo 3 caracteres'}));
				break;
			case 'email':
				utils.writeJson(res, new utils.respondWithCode(402, {'message': 'O e-mail deve ser válido'}));
				break;
			case 'password':
				utils.writeJson(res, new utils.respondWithCode(403, {'message': 'A senha deve possuir no mínimo 8 e no máximo 72 caracteres'}));
				break;
			default:
				utils.writeJson(res, new utils.respondWithCode(400, {'message': 'Ocorreu um erro interno'}));
				break;
		}

		return next();
	}

	User.createUser(req.body)
		.then(function () {
			utils.writeJson(res, new utils.respondWithCode(200, {'message': 'Operação bem sucedida'}));
		})
		.catch(function (response) {
			utils.writeJson(res, new utils.respondWithCode(405, {'message': response}));
		});
};
module.exports.logon = (req, res, next) => {
	if (!validationResult(req).isEmpty()) {
		return utils.writeJson(res, new utils.respondWithCode(400, {'message': 'Nome de usuário ou senha inválidos fornecidos.'}));
	}

	passport.authenticate('local', (err, user) => {
		if (err) {
			return utils.writeJson(res, new utils.respondWithCode(400, {'message': 'Nome de usuário ou senha inválidos fornecidos.'}));
		}

		req.login(user, (err) => {
			if (err) {
				return next(err);
			}

			return utils.writeJson(res, {'message': 'Operação bem sucedida'});
		})
	})(req, res, next);
};
module.exports.logoff = (req, res) => {
	req.logout();
	utils.writeJson(res, {'message': 'Deslogado com sucesso!'});
};
module.exports.findById = (id, next) => {
	User.findById(id)
		.then(function (response) {
			next(null, response);
		})
		.catch(function (response) {
			next(response, false);
		});
};
module.exports.loginUser = (email, password) => {
	return User.loginUser(email, password);
};

router.post('/', [
	check('name').isLength({min: 3}),
	check('email').isEmail(),
	check('password').isLength({min: 8, max: 72})
], module.exports.index);

router.post('/logon', [
	check('email').isEmail(),
	check('password').isLength({min: 8, max: 72})
], module.exports.logon);

router.get('/logoff', module.exports.logoff);
