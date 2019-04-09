'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils/writer.js');
const {check, validationResult} = require('express-validator/check');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();
const Order = require('../service/OrderService');
const Store = require('../service/StoreService');

module.exports = router;

router.post('/', [
	check('id_movie', 'Código do filme deve ser informado').not().isEmpty()
], (req, res, next) => {
	if (!req.isAuthenticated()) {
		return utils.writeJson(res, new utils.respondWithCode(400, {'message': 'Usuário não autenticado'}));
	}

	const err = validationResult(req);

	if (!err.isEmpty()) {
		const errors = err.array()[0];

		switch (errors.param) {
			case 'id_movie':
				utils.writeJson(res, new utils.respondWithCode(401, {'message': errors.msg}));
				break;
			default:
				utils.writeJson(res, new utils.respondWithCode(402, {'message': 'Ocorreu um erro interno'}));
				break;
		}

		return next();
	}

	let order = req.body;
	order.id_user = req.user.id_user;

	lock.acquire('movie', function (done) {
		Store.findMovieById(order.id_movie)
			.then(function (movie) {
				if (movie.is_available) {
					Order.placeOrder(order).then(function () {
						Store.rentMovie(movie).then(function () {
							done({'message': 'Operação bem sucedida'});
						});
					});
				} else {
					done(new utils.respondWithCode(405, {'message': 'Filme está não disponível'}));
				}
			})
			.catch(function () {
				done(new utils.respondWithCode(403, {'message': 'Filme não cadastrado'}));
			});
	}, function (ret) {
		utils.writeJson(res, ret);
	}, {});
});

router.put('/', [
	check('id_order', 'Código do pedido deve ser informado').not().isEmpty()
], (req, res, next) => {
	if (!req.isAuthenticated()) {
		return utils.writeJson(res, new utils.respondWithCode(400, {'message': 'Usuário não autenticado'}));
	}

	const err = validationResult(req);

	if (!err.isEmpty()) {
		const errors = err.array()[0];

		switch (errors.param) {
			case 'id_order':
				utils.writeJson(res, new utils.respondWithCode(401, {'message': errors.msg}));
				break;
			default:
				utils.writeJson(res, new utils.respondWithCode(402, {'message': 'Ocorreu um erro interno'}));
				break;
		}

		return next();
	}

	const order = req.body;

	lock.acquire('movie', function (done) {
		Order.findOrderById(order)
			.then(function (objOrder) {
				if (!objOrder.return_date) {
					Store.returnMovie(objOrder).then(function () {
						Order.returnOrder(objOrder).then(function () {
							done({'message': 'Operação bem sucedida'});
						});
					});
				} else {
					done(new utils.respondWithCode(403, {'message': 'Pedido já devolvido'}));
				}
			})
			.catch(function () {
				done(new utils.respondWithCode(404, {'message': 'Pedido não encontrado'}));
			});
	}, function (ret) {
		utils.writeJson(res, ret);
	}, {});
});
