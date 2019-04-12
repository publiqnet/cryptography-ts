/**
 * Created by vaz on 9/22/17.
 */
import { UrlObject } from '../../url-object/url-object';

export interface AccountOptions {
    id?;
    name?;
    options?;
    owner?;
    registrar?;
    rights_to_publish?;
    statistics?;
    top_n_control_flags?;

}
export class Account {
    id: string;
    name: string;
    options;
    owner;
    registrar;
    rights_to_publish;
    statistics;
    top_n_control_flags;

    constructor(options?: AccountOptions) {
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
            this.registrar = new UrlObject(options.registrar, '/block/account/');
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
}
