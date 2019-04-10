import { EventEmitter, Injectable, isDevMode } from '@angular/core';

export interface ErrorEventOptions {
    action?: string;
    message?: string;
    url?: string;
}
export class ErrorEvent {
    action?: string;
    message?: string;
    url?: string;

    constructor(options: ErrorEventOptions) {
        if (options.action) {
            this.action = options.action;
        }
        if (options.message) {
            this.message = options.message;
        }
        if (options.url) {
            this.url = options.url;
        }
    }
}

@Injectable()
export class ErrorService {

    private ErrorMessage = {
        default: 'Something went wrong',
        incorrect_public_key: 'Incorrect public key',
        signature_verification_error: 'Incorrect recovery phrase',
        invalid_amount_error: 'Insufficient PBQ Amount',
        account_not_found: 'Email or password is not correct',
        cant_transfer_in_same_account: 'Can’t transfer to the same account',
        your_balance_is_not_enough: 'Your balance is not enough',
        requested_account_doesnt_exist: 'Requested account doesn’t exist',
        transfer_failed: 'Seems like we’re having technical problems. Please try again later',
        password_error: 'Incorrect password',
        connection_error: 'There was a connection issue. Please try again later!',
        need_private_key: 'Transfer needs a private key!',
        load_balance_error: 'Seems like we’re having technical problems. Please try again later',
        transactions_not_found: 'Transactions Not Found',
        incorrect_recover_phrase: 'Incorrect recovery phrase.',
        ins_invalid_amount_error: 'Insufficient funds',
        account_already_exist: 'It seems you already have a PUBLIQ Wallet, try to <a href="/user/login">Login</a>',
        init_external_ws_service: 'init External WsService Connection Error',
        form_not_submitted: 'The form was filled in incorrectly',
        system_error: 'System error. Please try again later',
        confirm_registration: 'Please follow the secure link from your email to complete the registration.',
        complete_registration: 'Please follow the secure link from your email to complete the registration.',
        already_confirmed: 'This single use link has expired. Please login.'
    };

    public errorEventEmiter: EventEmitter<any> = new EventEmitter(true);

    constructor() {
    }

    getError(key) {
        return this.ErrorMessage[key] ? this.ErrorMessage[key] : this.ErrorMessage['default'];
    }

    public handleError(action: string, error: any, url = '') {
        let errorMessage = '';
        if (error.error && error.error.message) {
            errorMessage = error.error.message;
        } else if (error.error) {
            errorMessage = error.error;
        } else if (error) {
            errorMessage = error;
        } else {
            errorMessage = 'Not_Found';
        }

        if (isDevMode()) {
            console.log(action, errorMessage, url);
        }
        let key = '';
        if (error) {
            if (error.status === 0) {
                key = 'connection_error';
            } else if (error.status === 404) {
                key = 'account_not_found';
            } else if (error.status === 409) {
                key = errorMessage;
            } else {
                key = 'default';
            }
        }
        const message = this.getError(key);

        const errorEvent = new ErrorEvent({action: action, message: message, url: url});

        this.errorEventEmiter.emit(errorEvent);
    }

}
