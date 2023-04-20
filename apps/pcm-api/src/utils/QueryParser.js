"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryParserV4 = void 0;
var pcm_rules_parser_1 = require("@tandfgroup/pcm-rules-parser");
var pcm_schema_mapper_v4_1 = require("@tandfgroup/pcm-schema-mapper-v4");
exports.queryParserV4 = new pcm_rules_parser_1.QueryParser(pcm_schema_mapper_v4_1.SchemaMapperV4);
