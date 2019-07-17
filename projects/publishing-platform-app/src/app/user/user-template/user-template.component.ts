import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-user-template',
  templateUrl: './user-template.component.html',
  styleUrls: ['./user-template.component.scss']
})
export class UserTemplateComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  public tabberData = [];
  private activeRoute = 'login';

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
        }
      });
  }

  ngOnInit(): void {
    console.log(this.activeRoute);
    if (['login', 'register'].includes(this.activeRoute)) {
      this.tabberData = [
        { 'value': 'login', 'text': 'Sign In', 'active': this.activeRoute === 'login' },
        { 'value': 'register', 'text': 'Register', 'active': this.activeRoute === 'register' }
      ];
    }
  }

  changeTab(event) {
    if (event.value != this.activeRoute) {
      this.router.navigate([`/user/${event.value}`]);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
