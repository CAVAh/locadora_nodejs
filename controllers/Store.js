'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils/writer.js');
const Store = require('../service/StoreService');

module.exports = router;

router.get('/inventory', (req, res) => {
	Store.getInventory()
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
});

router.get('/findByTitle', (req, res) => {
	const title = req.query.title;

	Store.findMoviesByTitle(title)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
});
