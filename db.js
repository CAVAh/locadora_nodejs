const mysql = require('mysql');
const conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'locadora'
});

conn.connect(function (err) {
	if (err) {
		throw err;
	}

	console.log("BD conectado!");
});

module.exports = conn;
