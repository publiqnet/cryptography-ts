import { EventEmitter, Injectable, isDevMode } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

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
        default: 'default',
        signature_verification_error: 'signature_verification_error',
        system_error: 'system_error',
        email_error: 'email_error',
        incorrect_wallet_type: 'incorrect_wallet_type',
        free_wallet_not_found: 'free_wallet_not_found',
        user_not_found: 'user_not_found',
        code_expired: 'code_expired',
        article_not_found: 'article_not_found',
        stories_not_found: 'stories_not_found ',
        invalid_amount_error: 'invalid_amount_error',
        accout_update_balance_error: 'accout_update_balance_error',
        create_content_balance_error: 'create_content_balance_error',
        account_not_found: 'account_not_found',
        form_not_submitted: 'form_not_submitted',
        user_already_exist: 'user_already_exist',
        transfer_account_id_not_found: 'transfer_account_id_not_found',
        cant_transfer_in_same_account: 'cant_transfer_in_same_account',
        your_balance_is_not_enough: 'your_balance_is_not_enough',
        requested_account_doesnt_exist: 'requested_account_doesnt_exist',
        transfer_failed: 'transfer_failed',
        image_upload_error: 'image_upload_error',
        image_upload_error_explanation: 'image_upload_error_explanation',
        empty_content: 'empty_content',
        empty_meta: 'empty_meta',
        image_hash_upload_error: 'image_hash_upload_error',
        thumbnail_hash_upload_error: 'thumbnail_hash_upload_error',
        content_not_submited: 'content_not_submited',
        content_submit_failed: 'content_submit_failed',
        error_draft_validating_request: 'error_draft_validating_request',
        no_such_draft_associated_with_user: 'no_such_draft_associated_with_user',
        image_not_found: 'image_not_found',
        update_account_id_not_found: 'update_account_id_not_found',
        account_not_update: 'account_not_update',
        subscriber_not_found: 'subscriber_not_found',
        self_subscription: 'self_subscription',
        empty_username: 'empty_username',
        complete_registration: 'complete_registration',
        balance_exceeded_error: 'balance_exceeded_error',
        password_error: 'password_error',
        connection_error: 'connection_error',
        invalid_session_id: 'invalid_session_id',
        need_private_key: 'need_private_key',
        not_found_transfer_from_account: 'not_found_transfer_from_account',
        not_found_transfer_to_account: 'not_found_transfer_to_account',
        load_balance_error: 'load_balance_error',
        ins_invalid_amount_error: 'validation.ins_invalid_amount_error',
        incorrect_recover_phrase: 'incorrect_recovery_phrase',
        boost_content_balance_error: 'boost_content_balance_error'
    };

    public errorEventEmiter: EventEmitter<any> = new EventEmitter(true);

    constructor(public translateService: TranslateService) {
    }

    getError(key) {
      return this.translateService.instant(
            `${
                this.ErrorMessage[key]
                    ? 'error.' + this.ErrorMessage[key]
                    : 'error.' + this.ErrorMessage['default']
                }`
        );
    }

    public handleError(action: string, error: any, url = '') {
        if (isDevMode()) {
            console.log(
                action,
                (error && error.error && error.error.message) || error.error || error,
                url
            );
        }
        let key = '';
        if (error) {
            if (error.status === 0) {
                key = 'connection_error';
            } else if (error.status === 409) {
                key = error.error.message || error.error || error;
            } else {
                key = 'default';
            }
        }
        const message = this.getError(key);
        const errorEvent = new ErrorEvent({
            action: action,
            message: message,
            url: url
        });

        this.errorEventEmiter.emit(errorEvent);
    }
}
