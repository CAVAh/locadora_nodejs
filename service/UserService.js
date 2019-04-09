'use strict';

const db = require('../db');
const bcrypt = require('bcrypt-nodejs');
const saltRounds = 10;

/**
 * Procura um usuário pelo seu código
 *
 * @param id Int Código que precisa ser considerado para o filtro
 * @returns {Promise<Object>}
 */
exports.findById = function (id) {
	return new Promise((resolve, reject) => {
		if (id) {
			const sql = 'SELECT id_user, name, email \
						 FROM user \
						 WHERE id_user = ?';

			db.query(sql, [id], (err, result) => {
				if (err || result.length === 0) {
					reject();
				}

				resolve(result[0]);
			});
		}
	});
};

/**
 * Criar usuário
 * Isso só pode ser feito pelo usuário logado.
 *
 * @param user User Objeto de usuário a ser criado
 * @returns {Promise<Object>}
 **/
exports.createUser = function (user) {
	return new Promise((resolve, reject) => {
		const sql = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';

		bcrypt.genSalt(saltRounds, function (err, salt) {
			bcrypt.hash(user.password, salt, null, function (err, hash) {
				db.query(sql, [user.name, user.email, hash], (err, result) => {
					if (err) {
						if (err.code === 'ER_DUP_ENTRY') {
							return reject('E-mail já está cadastrado no sistema');
						}

						throw err;
					}

					resolve(result);
				});
			});
		});
	});
};

/**
 * Autenticar usuário no sistema
 *
 * email String O email para o logon
 * password String A senha para o logon em clear text
 * returns {Promise<Object>}
 **/
exports.loginUser = function (email, password) {
	return new Promise((resolve, reject) => {
		if (email && password) {
			const sql = 'SELECT id_user, name, email, password \
						 FROM user \
						 WHERE email = ?';

			db.query(sql, [email], (err, result) => {
				if (!err && result.length > 0) {
					try {
						if (bcrypt.compareSync(password, result[0].password)) {
							return resolve(result);
						}
					} catch (e) {
					}
				}

				return reject('Nome de usuário ou senha inválidos fornecidos!');
			});
		}
	});
};
