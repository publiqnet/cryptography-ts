export interface AccountHistoryOptions {
    id?;
    m_from_account?;
    m_operation_type?;
    m_str_description?;
    m_timestamp?;
    m_to_account?;
    m_transaction_amount?;
    m_transaction_fee?;
}

export class AccountHistory {
    id;
    m_from_account;
    m_operation_type;
    m_str_description;
    m_timestamp;
    m_to_account;
    m_transaction_amount;
    m_transaction_fee;

    constructor(options?: AccountHistoryOptions) {
        if (options.id) {
            this.id = options.id;
        }

        if (options.m_from_account) {
            this.m_from_account = options.m_from_account;
        }
        if (options.m_operation_type) {
            this.m_operation_type = options.m_operation_type;
        }
        if (options.m_str_description) {
            this.m_str_description = options.m_str_description;
        }

        if (options.m_timestamp) {
            this.m_timestamp = options.m_timestamp;
        }

        if (options.m_to_account) {
            this.m_to_account = options.m_to_account;
        }


        if (options.m_transaction_amount) {
            this.m_transaction_amount = options.m_transaction_amount;
        }

        if (options.m_transaction_fee) {
            this.m_transaction_fee = options.m_transaction_fee;
        }

    }
}
