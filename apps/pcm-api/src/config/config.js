"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var env_properties_1 = require("./env-properties");
/**
 * Loads the config and provides helper methods
 */
var Config = exports.Config = /** @class */ (function () {
    function Config() {
    }
    /**
     * Initialize the environment
     */
    Config.initialize = function () {
        var env = this.getEnvironment() || 'DEV';
        // Note: We are using Object.assign which will re-assign the root level properties only.
        this.config = Object.assign(env_properties_1.commonConfigProperties, env_properties_1.configProperties[env]);
    };
    /**
     * Get Property Values For A Key
     * @param  {string} key Property Key
     * @return {any}        Can be a string or an object
     */
    Config.getPropertyValue = function (key) {
        return this.config[key];
    };
    Config.getEnvironment = function () {
        var environment = process.env.NODE_ENV;
        if (environment && this.devValuesArray.indexOf(environment) > -1) {
            return 'DEV';
        }
        else if (environment && this.prodValuesArray.indexOf(environment) > -1) {
            return 'PRODUCTION';
        }
        else if (environment && this.uatValuesArray.indexOf(environment) > -1) {
            return 'UAT';
        }
        else if (environment && this.localValuesArray.indexOf(environment) > -1) {
            return 'LOCAL';
        }
        else if (environment && this.qaValuesArray.indexOf(environment) > -1) {
            return 'QA';
        }
        else if (environment && this.testValuesArray.indexOf(environment) > -1) {
            return 'TEST';
        }
        return null;
    };
    Config.devValuesArray = [
        'dev',
        'DEV',
        'development',
        'DEVELOPMENT'
    ];
    Config.prodValuesArray = [
        'prod',
        'PROD',
        'production',
        'PRODUCTION'
    ];
    Config.uatValuesArray = ['uat', 'UAT'];
    Config.localValuesArray = ['local', 'LOCAL'];
    Config.qaValuesArray = ['qa', 'QA'];
    Config.testValuesArray = ['test', 'TEST'];
    return Config;
}());
Config.initialize();
