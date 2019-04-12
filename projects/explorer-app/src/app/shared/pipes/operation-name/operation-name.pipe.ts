import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export enum OperationType {
    transfer,
    account_create,
    content_submit,
    content_buy,
    content_rate,
    subscription,
    content_submit_second = 20
}

@Pipe({
    name: 'OperationName'
})
export class OperationNamePipe implements PipeTransform {

    constructor() {
    }

    transform(value: number): string {
        switch (value) {
            case OperationType.transfer: return 'Transfer';
            case OperationType.account_create: return 'Account create';
            case OperationType.content_submit: return 'Submit content';
            case OperationType.content_submit_second: return 'Submit content';
            case OperationType.content_buy: return 'Content buy';
            case OperationType.content_rate: return 'Content rate';
            case OperationType.subscription: return 'Subscription';
        }
    }
}
