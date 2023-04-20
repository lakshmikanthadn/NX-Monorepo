"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elasticsearch_1 = require("@elastic/elasticsearch");
var config_1 = require("../../config/config");
var esURL = config_1.Config.getPropertyValue('ESUrl');
var esClient = new elasticsearch_1.Client({
    node: esURL
});
exports.default = esClient;
