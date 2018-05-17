'use strict';
var Data = require('../models/Data');
module.exports.paramsToData = function(raw_data) {
	return new Data(raw_data.id, raw_data.name, raw_data.price);
}