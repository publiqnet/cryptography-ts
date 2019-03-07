import { Account, IAccount } from '../';
import { PrivateKey, PublicKey, Aes } from 'arcnet-js';
import { Subject, Observable } from 'rxjs';

/**
 * Created by vaz on 6/6/17.
 */

export class TransactionDetailMemoObject {
  valid: boolean;
  from: string;
  message: string;
  nonce: string;
  to: string;

  constructor(transaction) {
    if (!transaction.m_transaction_encrypted_memo) {
      this.valid = false;
    } else {
      this.valid = true;
      this.from = transaction.m_transaction_encrypted_memo.from;
      this.message = transaction.m_transaction_encrypted_memo.message;
      this.nonce = transaction.m_transaction_encrypted_memo.nonce;
      this.to = transaction.m_transaction_encrypted_memo.to;
    }
  }

  getMessage(account): string {
    if (!this.valid) {
      return '';
    }
    // console.log('Aes', Aes.decrypt_with_checksum);
    // const pKey = PrivateKey.fromWif(account.pKey);
    let pKey = account.pKey;

    if (pKey.constructor.name == 'String') {
      pKey = PrivateKey.fromWif(account.pKey);
    }

    let sender = PublicKey.fromPublicKeyString(this.from);
    if (pKey.toPublicKey() && pKey.toPublicKey() === this.from) {
      sender = PublicKey.fromPublicKeyString(this.to);
    }

    try {
      const plaintext = Aes.decrypt_with_checksum(
        pKey,
        sender,
        this.nonce,
        this.message
      );
      return plaintext.toString();
    } catch (err) {
      return '';
    }
  }
}

export class TransactionDetailObject {
  id: string;
  m_from_account_full: Observable<any>;
  m_from_account: string;
  m_to_account: string;
  m_operation_type: number;
  m_transaction_amount: number;
  m_transaction_fee: number;
  m_str_description: string;
  m_timestamp: string;
  m_memo_decrypted: string;
  m_memo: TransactionDetailMemoObject;

  constructor(transaction) {
    this.id = transaction.id;
    this.m_from_account = transaction.m_from_account;
    this.m_to_account = transaction.m_to_account;
    this.m_operation_type = transaction.m_operation_type;
    this.m_transaction_amount = transaction.m_transaction_amount;
    this.m_transaction_fee = transaction.m_transaction_fee;
    this.m_str_description = transaction.m_str_description;
    this.m_timestamp = transaction.m_timestamp;
    this.m_memo = new TransactionDetailMemoObject(transaction);
  }
}
