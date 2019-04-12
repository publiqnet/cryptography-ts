"use strict";
/**
 * Created by vaz on 9/20/17.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var HomepageComponent = (function () {
    function HomepageComponent(apiService) {
        this.apiService = apiService;
        this.blocks = [];
        this.today = new Date();
    }
    HomepageComponent.prototype.ngOnInit = function () {
        var _this = this;
        var blockId = 1;
        // for (let index = 0; index < 10; index++) {
        //     this.addBlock(blockId++);
        // }
        //
        // setInterval(() => {
        //     this.addBlock(blockId++);
        // }, 5000);
        this.apiService.getHeadBlock()
            .subscribe(function (data) {
            _this.blocks.unshift(data);
            if (_this.blocks.length > 10) {
                _this.blocks.pop();
            }
        });
    };
    HomepageComponent.prototype.addBlock = function (block_id) {
        var _this = this;
        this.apiService.getBlock(block_id)
            .subscribe(function (data) {
            _this.blocks.unshift(data);
            if (_this.blocks.length > 10) {
                _this.blocks.pop();
            }
        });
    };
    return HomepageComponent;
}());
HomepageComponent = __decorate([
    core_1.Component({
        selector: 'homepage',
        templateUrl: 'homepage.component.html'
    })
], HomepageComponent);
exports.HomepageComponent = HomepageComponent;
