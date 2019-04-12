"use strict";
/**
 * Created by vaz on 9/22/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Account = (function () {
    function Account(options) {
        if (options.id) {
            this.id = options.id;
        }
        if (options.name) {
            this.name = options.name;
        }
        if (options.options) {
            this.options = options.options;
        }
        if (options.owner) {
            this.owner = options.owner;
        }
        if (options.registrar) {
            this.registrar = options.registrar;
        }
        if (options.rights_to_publish) {
            this.rights_to_publish = options.rights_to_publish;
        }
        if (options.statistics) {
            this.statistics = options.statistics;
        }
        if (options.top_n_control_flags) {
            this.top_n_control_flags = options.top_n_control_flags;
        }
    }
    return Account;
}());
exports.Account = Account;
