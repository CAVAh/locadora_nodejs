const request = require('supertest');
const app = require('../server');
const equal = require('deep-equal');
const db = require('../db');
const rand = Math.floor(Math.random() * 1000) + 1;

describe('GET /', function () {
	it('responde com seja bem-vindo', function (done) {
		request(app)
			.get('/')
			.expect('Content-Type', /json/)
			.expect('Content-Length', '29')
			.expect(200, '"Seja bem-vindo à Locadora!"')
			.end(function (err) {
				if (err) {
					return done(err);
				}

				done();
			});
	});
});

describe('/store', function () {
	describe('GET /inventory', function () {
		it('responde com json', function (done) {
			request(app)
				.get('/store/inventory')
				.expect('Content-Type', /json/)
				.expect(200)
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});
	});

	describe('GET /findByTitle', function () {
		it('responde com json', function (done) {
			request(app)
				.get('/store/findByTitle')
				.query({title: 'chefão'})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function (res) {
					if (JSON.parse(res.text).length !== 2) {
						throw new Error('Difere em tamanho');
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});
	});
});

describe('/user', function () {
	describe('POST /', function () {
		it('nome inferior a 3', function (done) {
			request(app)
				.post('/user')
				.send('name=Lu')
				.expect('Content-Type', /json/)
				.expect(401)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'O nome deve possuir no mínimo 3 caracteres'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('email incorreto', function (done) {
			request(app)
				.post('/user')
				.send('name=Lucas&email=asdjassd')
				.expect('Content-Type', /json/)
				.expect(402)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'O e-mail deve ser válido'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('senha inferior a 8 digitos', function (done) {
			request(app)
				.post('/user')
				.send('name=Lucas&email=lucas@test.com&password=123')
				.expect('Content-Type', /json/)
				.expect(403)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'A senha deve possuir no mínimo 8 e no máximo 72 caracteres'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('senha superior a 72 digitos', function (done) {
			request(app)
				.post('/user')
				.send('name=Lucas&email=lucas@test.com&password=1234567890123456789012345678901234567890123456789012345678901234567890123')
				.expect('Content-Type', /json/)
				.expect(403)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'A senha deve possuir no mínimo 8 e no máximo 72 caracteres'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('usuario cadastrado com sucesso', function (done) {
			request(app)
				.post('/user')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.expect('Content-Type', /json/)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Operação bem sucedida'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.expect(200)
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('email já cadastrado', function (done) {
			request(app)
				.post('/user')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.expect('Content-Type', /json/)
				.expect(405)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'E-mail já está cadastrado no sistema'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});
	});

	describe('POST /logon', function () {
		it('email incorreto', function (done) {
			request(app)
				.post('/user/logon')
				.send('name=Lucas&email=lucass' + rand + '@test.com&password=123456789')
				.expect('Content-Type', /json/)
				.expect(400)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Nome de usuário ou senha inválidos fornecidos.'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('senha incorreta', function (done) {
			request(app)
				.post('/user/logon')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=123456789')
				.expect('Content-Type', /json/)
				.expect(400)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Nome de usuário ou senha inválidos fornecidos.'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('autenticado com sucesso', function (done) {
			request(app)
				.post('/user/logon')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.expect('Content-Type', /json/)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Operação bem sucedida'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.expect(200)
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});
	});

	describe('GET /logoff', function () {
		it('deslogado com sucesso', function (done) {
			request(app)
				.get('/user/logoff')
				.expect('Content-Type', /json/)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Deslogado com sucesso!'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.expect(200)
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		})
	});
});

describe('/order', function () {
	const agent = request.agent(app);

	describe('POST /', function () {
		it('usuario nao autenticado', function (done) {
			request(app)
				.post('/order')
				.send('id_movie=1')
				.expect('Content-Type', /json/)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Usuário não autenticado'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.expect(400)
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('codigo do filme nao informado', function (done) {
			agent
				.post('/user/logon')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.end(function () {
					agent
						.post('/order')
						.send('')
						.expect('Content-Type', /json/)
						.expect(function (res) {
							if (!equal(JSON.parse(res.text), {'message': 'Código do filme deve ser informado'})) {
								throw new Error('Mensagem diferente: ' + res.text);
							}
						})
						.expect(401)
						.end(function (err) {
							if (err) {
								return done(err);
							}

							done();
						});
				});
		});

		it('filme nao existe', function (done) {
			agent
				.post('/user/logon')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.end(function () {
					agent
						.post('/order')
						.send('id_movie=0')
						.expect('Content-Type', /json/)
						.expect(function (res) {
							if (!equal(JSON.parse(res.text), {'message': 'Filme não cadastrado'})) {
								throw new Error('Mensagem diferente: ' + res.text);
							}
						})
						.expect(403)
						.end(function (err) {
							if (err) {
								return done(err);
							}

							done();
						});
				});
		});

		it('filme indisponível', function (done) {
			db.query('UPDATE movie SET rented_quantity = quantity WHERE id_movie = 3', function () {
				agent
					.post('/user/logon')
					.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
					.end(function () {
						agent
							.post('/order')
							.send('id_movie=3')
							.expect('Content-Type', /json/)
							.expect(function (res) {
								if (!equal(JSON.parse(res.text), {'message': 'Filme está não disponível'})) {
									throw new Error('Mensagem diferente: ' + res.text);
								}
							})
							.expect(405)
							.end(function (err) {
								if (err) {
									return done(err);
								}

								done();
							});
					});
			});
		});

		it('filme alugado com sucesso', function (done) {
			db.query('UPDATE movie SET rented_quantity = 0 WHERE id_movie = 1', function () {
				agent
					.post('/user/logon')
					.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
					.end(function () {
						agent
							.post('/order')
							.send('id_movie=1')
							.expect('Content-Type', /json/)
							.expect(function (res) {
								if (!equal(JSON.parse(res.text), {'message': 'Operação bem sucedida'})) {
									throw new Error('Mensagem diferente: ' + res.text);
								}
							})
							.expect(200)
							.end(function (err) {
								if (err) {
									return done(err);
								}

								done();
							});
					});
			});
		});
	});

	describe('PUT /', function () {
		it('usuario nao autenticado', function (done) {
			request(app)
				.post('/order')
				.send('id_movie=1')
				.expect('Content-Type', /json/)
				.expect(function (res) {
					if (!equal(JSON.parse(res.text), {'message': 'Usuário não autenticado'})) {
						throw new Error('Mensagem diferente: ' + res.text);
					}
				})
				.expect(400)
				.end(function (err) {
					if (err) {
						return done(err);
					}

					done();
				});
		});

		it('codigo do pedido nao informado', function (done) {
			agent
				.post('/user/logon')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.end(function () {
					agent
						.put('/order')
						.send('')
						.expect('Content-Type', /json/)
						.expect(function (res) {
							if (!equal(JSON.parse(res.text), {'message': 'Código do pedido deve ser informado'})) {
								throw new Error('Mensagem diferente: ' + res.text);
							}
						})
						.expect(401)
						.end(function (err) {
							if (err) {
								return done(err);
							}

							done();
						});
				});
		});

		it('pedido não encontrado', function (done) {
			agent
				.post('/user/logon')
				.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
				.end(function () {
					agent
						.put('/order')
						.send('id_order=0')
						.expect('Content-Type', /json/)
						.expect(function (res) {
							if (!equal(JSON.parse(res.text), {'message': 'Pedido não encontrado'})) {
								throw new Error('Mensagem diferente: ' + res.text);
							}
						})
						.expect(404)
						.end(function (err) {
							if (err) {
								return done(err);
							}

							done();
						});
				});
		});

		it('pedido já devolvido', function (done) {
			db.query('UPDATE orders SET return_date = CURRENT_TIME WHERE id_order = 6', function () {
				agent
					.post('/user/logon')
					.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
					.end(function () {
						agent
							.put('/order')
							.send('id_order=6')
							.expect('Content-Type', /json/)
							.expect(function (res) {
								if (!equal(JSON.parse(res.text), {'message': 'Pedido já devolvido'})) {
									throw new Error('Mensagem diferente: ' + res.text);
								}
							})
							.expect(403)
							.end(function (err) {
								if (err) {
									return done(err);
								}

								done();
							});
					});
			});
		});

		it('pedido devolvido com sucesso', function (done) {
			db.query('UPDATE orders SET return_date = NULL WHERE id_order = 8', function () {
				agent
					.post('/user/logon')
					.send('name=Lucas&email=lucas' + rand + '@test.com&password=1234567890')
					.end(function () {
						agent
							.put('/order')
							.send('id_order=8')
							.expect('Content-Type', /json/)
							.expect(function (res) {
								if (!equal(JSON.parse(res.text), {'message': 'Operação bem sucedida'})) {
									throw new Error('Mensagem diferente: ' + res.text);
								}
							})
							.expect(200)
							.end(function (err) {
								if (err) {
									return done(err);
								}

								done();
							});
					});
			});
		});
	});
});
