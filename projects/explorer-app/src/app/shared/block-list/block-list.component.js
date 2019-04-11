"use strict";
/**
 * Created by vaz on 9/22/17.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var BlockListComponent = (function () {
    function BlockListComponent() {
    }
    return BlockListComponent;
}());
__decorate([
    core_1.Input()
], BlockListComponent.prototype, "blocks", void 0);
BlockListComponent = __decorate([
    core_1.Component({
        selector: 'block-list',
        templateUrl: 'src/app/shared/block-list/block-list.component.html'
    })
], BlockListComponent);
exports.BlockListComponent = BlockListComponent;
