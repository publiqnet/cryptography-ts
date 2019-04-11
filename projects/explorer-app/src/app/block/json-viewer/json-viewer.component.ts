// The code below is basically a fork of the https://github.com/temich666/t-json-viewer
// and unfortunatelly it generates some tslint errors.
// The easiest way to deal with them for now is to disable linting in those files :(
/* tslint:disable */
import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Pbq} from '../../pbq/pbq';
import {PbqPipe} from '../../shared/pipes/pbq/pbq.pipe';

import isString from 'lodash-es/isString';
import isObject from 'lodash-es/isObject';
import isNumber from 'lodash-es/isNumber';
import isBoolean from 'lodash-es/isBoolean';
import isDate from 'lodash-es/isDate';
import isFunction from 'lodash-es/isFunction';
import isArray from 'lodash-es/isArray';
import {UrlObject} from '../../url-object/url-object';
import {TransactionEncryptedMemo} from '../account/accountHistory';

interface Item {
    key: string;
    value: any;
    title: string;
    type: string;
    isOpened: boolean;
}

@Component({
    selector: 'json-viewer',
    templateUrl: './json-viewer.component.html',
    styleUrls: ['./json-viewer.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class JsonViewerComponent implements OnInit {

    @Input() json: Array<any> | Object | any;
    @Input() showObjectSummery = true;
    @Input() showArraySummery = true;

    @Input()
    get expanded(): boolean {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = value;
    }

    asset: Array<Item> = [];
    private _expanded: boolean = false;

    constructor(private pbq: PbqPipe) {

    }

    ngOnInit() {
        // Do nothing without data
        if (!isObject(this.json) && !isArray(this.json)) {
            return;
        }

        /**
         * Convert json to array of items
         */
        Object.keys(this.json).forEach((key) => {
            this.asset.push(this.createItem(key, this.json[key]));
        });
    }

    /**
     * Check value and Create item object
     * @param {string|any} key
     * @param {any} value
     */
    private createItem(key: any, value: any): Item {
        let item: Item = {
            key: key || '""', // original key or empty string
            value: value, // original value
            title: value, // title by default
            type: undefined,
            isOpened: false
        };

        if (isString(item.value)) {
            item.type = 'string';
            item.title = `${item.value}`;
        }

        else if (isNumber(item.value)) {
            item.type = 'number';
        }

        else if (isBoolean(item.value)) {
            item.type = 'boolean';
        }

        else if (isDate(item.value)) {
            item.type = 'date';
        }

        else if (isFunction(item.value)) {
            item.type = 'function';
        }

        else if (isArray(item.value)) {
            item.type = 'array';
            item.title = (this.showArraySummery) ? `Array[${item.value.length}] ${JSON.stringify(item.value)}` : '';
            item.isOpened = this.expanded;
        }

        else if (isObject(item.value)) {
            // check if it is and Block
            if (item.value instanceof Pbq) {
                item.type = 'pbq';
                item.title = (this.showObjectSummery) ? `Object ${this.pbq.transform(item.value.amount)}` : this.pbq.transform(item.value.amount);
            } else if (item.value instanceof UrlObject) {
                item.type = 'url';
                item.title = item.value.route;
            }  else if(item.value instanceof TransactionEncryptedMemo) {
                if(item.value.to instanceof UrlObject) {
                    item.type = 'object';
                    item.title = (this.showObjectSummery) ? `Object ${JSON.stringify(item.value.to.link)}` : '';
                }
                if(item.value.from instanceof UrlObject) {
                    item.type = 'object';
                    item.title = (this.showObjectSummery) ? `Object ${JSON.stringify(item.value.from.link)}` : '';
                }
            } else {
                item.type = 'object';
                item.title = (this.showObjectSummery) ? `Object ${JSON.stringify(item.value)}` : '';
            }

            item.isOpened = this.expanded;
        }

        else if (item.value === null) {
            item.type = 'null';
            item.title = 'null';
        }

        else if (item.value === undefined) {
            item.type = 'undefined';
            item.title = 'undefined';
        }

        item.title = '' + item.title; // defined type or 'undefined'

        return item;
    }

    /**
     * Check item's type for Array or Object
     * @param {Item} item
     * @return {boolean}
     */
    isObject(item: Item): boolean {
        return ['object', 'array'].indexOf(item.type) !== -1;
    }

    /**
     * Handle click event on collapsable item
     * @param {Item} item
     */
    clickHandle(item: Item) {
        if (!this.isObject(item)) {
            return;
        }
        item.isOpened = !item.isOpened;
    }

}
