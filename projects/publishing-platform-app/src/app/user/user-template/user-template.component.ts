import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-user-template',
  templateUrl: './user-template.component.html',
  styleUrls: ['./user-template.component.scss']
})
export class UserTemplateComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  public tabberData = [];
  public activeRoute = 'login';
  public swiperConfig: SwiperOptions;

  constructor(
    private router: Router
  ) {
    this.router.events
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.activeRoute = event.url.substring(event.url.lastIndexOf('/') + 1);
          this.generateTabberData();
        }
      });
  }

  ngOnInit(): void {
    this.swiperConfig = {
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      spaceBetween: 30
    };
  }

  generateTabberData() {
    if (['login', 'register'].includes(this.activeRoute)) {
      this.tabberData = [
        { 'value': 'login', 'text': 'Sign In', 'active': this.activeRoute === 'login' },
        { 'value': 'register', 'text': 'Register', 'active': this.activeRoute === 'register' }
      ];
    } else {
      this.tabberData = [];
    }
  }

  changeTab(event) {
    if (event.value != this.activeRoute) {
      this.router.navigate([`/user/${event.value}`]);
    }
  }

  changeRoute(event, route) {
    event.preventDefault();
    this.router.navigate([route]);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
