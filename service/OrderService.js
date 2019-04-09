'use strict';

const db = require('../db');

/**
 * Cria o pedido de locação de um filme
 *
 * order Order Locação feita para um filme
 * returns {Promise<Object>}
 **/
exports.placeOrder = function (order) {
	return new Promise((resolve) => {
		const sql = 'INSERT INTO orders (id_movie, id_user) VALUES (?, ?)';

		db.query(sql, [order.id_movie, order.id_user], (err, result) => {
			if (err) {
				throw err;
			}

			resolve(result);
		});
	});
};

/**
 * Encontra o pedido pelo código
 *
 * order Object Objeto que precisa ser considerado para o filtro
 * returns {Promise<Object>}
 **/
exports.findOrderById = function (order) {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT id_order, id_user, id_movie, rental_date, return_date \
			FROM orders \
			WHERE id_order = ?';

		db.query(sql, [order.id_order], (err, result) => {
			if (err) {
				throw err;
			}

			if (result.length === 0) {
				reject();
			} else {
				resolve(result[0]);
			}
		});
	});
};

/**
 * Devolução de pedido
 *
 * order Order Objeto pedido que precisa ser devolvido à loja
 * returns {Promise<Object>}
 **/
exports.returnOrder = function (order) {
	return new Promise(function (resolve) {
		const sql = 'UPDATE orders \
					 SET return_date = CURRENT_TIME\
					 WHERE id_order = ?';

		db.query(sql, [order.id_order], (err, result) => {
			if (err) {
				throw err;
			}

			resolve(result);
		});
	});
};
