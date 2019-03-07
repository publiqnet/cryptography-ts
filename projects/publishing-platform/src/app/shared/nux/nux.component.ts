import { Component, Inject, Input, PLATFORM_ID, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NuxService } from '../../core/services/nux.service';
import { AccountService } from '../../core/services/account.service';
declare var jQuery;

const scrollElementIntoView = (element: HTMLElement) => {

    const scrollTop = window.pageYOffset || element.scrollTop;

    const finalOffset = Math.max(0, element.getBoundingClientRect().top + scrollTop - 300);

    jQuery('html, body').animate({
        scrollTop: finalOffset
    });
};

export interface NuxPositioning {
    'nux'?: boolean;
    'nux-bottom'?: boolean;
    'nux-top'?: boolean;
    'nux-left'?: boolean;
    'nux-right'?: boolean;
    'nux-pointer-bottom'?: boolean;
    'nux-pointer-top'?: boolean;
    'nux-pointer-left'?: boolean;
    'nux-pointer-right'?: boolean;
    'left'?: boolean;
    'right'?: boolean;
    'top'?: boolean;
    'bottom'?: boolean;
    'scroll'?: string;
}

@Component({
    selector: 'app-nux',
    templateUrl: './nux.component.html',
    styleUrls: ['./nux.component.scss']
})
export class NuxComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() page: string;
    @Input() key: string;
    @Input() title: string;
    @Input() step: number;
    @Input() positionConfig: NuxPositioning = { 'nux-top': true, 'left': true };
    subscription: Subscription;


    constructor(public el: ElementRef, public nuxService: NuxService, private accountService: AccountService) { }

    ngOnInit(): void {
        // class "nux" must be on by default
        if (this.positionConfig['nux-top']) {
            this.positionConfig['nux-pointer-top'] = false;
            this.positionConfig['nux-pointer-bottom'] = true;
        } else
            if (this.positionConfig['nux-bottom']) {
                this.positionConfig['nux-pointer-bottom'] = false;
                this.positionConfig['nux-pointer-top'] = true;
            } else
                if (this.positionConfig['nux-left']) {
                    this.positionConfig['nux-pointer-left'] = false;
                    this.positionConfig['nux-pointer-right'] = true;
                } else
                    if (this.positionConfig['nux-right']) {
                        this.positionConfig['nux-pointer-right'] = false;
                        this.positionConfig['nux-pointer-left'] = true;
                    }
        this.positionConfig.nux = true;
        this.nuxService.keys.editor[this.step] = this.key;
    }

    ngAfterViewInit(): void {
        this.subscription = this.nuxService.currentStep.subscribe((step: number) => {
            if (this.key === this.nuxService.keys[this.page][step]) {
                const sibling = this.el.nativeElement.nextElementSibling;

                scrollElementIntoView(sibling);
            }
        });
    }

    // get shouldHide(): boolean {
    //     return this.nuxService.shouldHide;
    // }

    get keys(): string[] {
        return this.nuxService.keys[this.page];
    }

    get currentStep(): number {
        return this.nuxService.currentStep.value;
    }

    previous(e: Event): void {
        this.nuxService.currentStep.next((this.nuxService.currentStep.value - 1 >= 0)
            ? this.nuxService.currentStep.value - 1
            : 0);
        e.preventDefault();
        e.stopPropagation();
    }

    next(e: Event): void {
        let nextStep = this.currentStep;
        do {
            nextStep++;
            // console.log('checking next index: ', nextStep);
        } while (!this.keys[nextStep] && nextStep < this.keys.length - 1);

        if (nextStep && nextStep <= this.keys.length - 1) {
            this.nuxService.currentStep.next(nextStep);
        } else {
            this.finish();
        }
        e.preventDefault();
        e.stopPropagation();
    }

    finish(e?: Event): void {
        this.accountService.accountInfo.nuxEditor = true;
        this.accountService.accountUpdated$.next(this.accountService.accountInfo);
        this.nuxService.finishNux(this.page);
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            // console.log('unsub', this.currentStep, this.shouldHide);
            this.subscription.unsubscribe();
        }
        this.nuxService.reset(this.page);
    }
}
