'use strict';

const db = require('../db');

/**
 * Encontra o filme pelo título
 * Pode ser passado o nome completo do título, como também uma parte do título
 *
 * title String Título que precisa ser considerado para o filtro
 * returns {Promise<Object>}
 **/
exports.findMoviesByTitle = function (title) {
	return new Promise((resolve) => {
		const sql = 'SELECT m.id_movie, m.id_director, m.title, m.quantity, m.rented_quantity, d.name as director_name, (m.quantity > m.rented_quantity) as is_available \
			FROM movie m \
			JOIN director d on m.id_director = d.id_director \
			WHERE m.title LIKE ?';

		title = '%' + title + '%';

		db.query(sql, [title], (err, result) => {
			if (err) {
				throw err;
			}

			resolve(result);
		});
	});
};

/**
 * Encontra o filme pelo código
 *
 * id_movie Int Código que precisa ser considerado para o filtro
 * returns {Promise<Object>}
 **/
exports.findMovieById = function (id_movie) {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT m.id_movie, m.id_director, m.title, m.quantity, m.rented_quantity, d.name as director_name, (m.quantity > m.rented_quantity) as is_available \
			FROM movie m \
			JOIN director d on m.id_director = d.id_director \
			WHERE m.id_movie = ?';

		db.query(sql, [id_movie], (err, result) => {
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
 * Realiza a retirada do filme da loja
 *
 * @param movie Object Filme que será retirado da loja
 * @returns {Promise<Object>}
 */
exports.rentMovie = function (movie) {
	return new Promise((resolve) => {
		const sql = 'UPDATE movie \
			 		 SET rented_quantity = rented_quantity + 1 \
			 		 WHERE id_movie = ?';

		db.query(sql, [movie.id_movie], (err, result) => {
			if (err) {
				throw err;
			}

			resolve(result);
		});
	});
};

/**
 * Realiza a colocação do filme devolta na loja
 *
 * @param order Object Ordem que está sendo concluída
 * @returns {Promise<Object>}
 */
exports.returnMovie = function (order) {
	return new Promise((resolve) => {
		const sql = 'UPDATE movie \
			 		 SET rented_quantity = rented_quantity - 1 \
			 		 WHERE id_movie = ?';

		db.query(sql, [order.id_movie], (err, result) => {
			if (err) {
				throw err;
			}

			resolve(result);
		});
	});
};


/**
 * Retorna uma lista dos filmes disponíveis na locadora
 *
 * returns {Promise<Object>}
 **/
exports.getInventory = function () {
	return new Promise((resolve) => {
		const sql = 'SELECT m.id_movie, m.id_director, m.title, m.quantity, m.rented_quantity, d.name as director_name \
					 FROM movie m \
					 JOIN director d on m.id_director = d.id_director \
					 WHERE m.quantity > m.rented_quantity';

		db.query(sql, (err, result) => {
			if (err) {
				throw err;
			}

			resolve(result);
		});
	});
};
