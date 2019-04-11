import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private router: Router,
              private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .subscribe((evt) => {
          if (!(evt instanceof NavigationEnd)) {
            return;
          }
          window.scrollTo(0, 0);
        });

    }
  }
}
