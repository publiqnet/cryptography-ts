/* tslint:disable */
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

function initializeLettersAnimation() {
  let app = {
    chars: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ճ', 'դ', 'գ', 'վ', 'ո', 'ֆ', 'ծ', 'զ', 'ր', '会', '联', '伴', '作', '团', '用', '式', '新', '者', '我', '员', '的', '各'],

    init: function () {
      app['container'] = document.createElement('div');
      app['container'].className = 'animation-container';
      document.body.appendChild(app['container']);
      (window as any).initializeLettersAnimation.interval = (window as any).setInterval(app.add, 100);
    },

    add: function () {
      let element = document.createElement('span');
      app['container'].appendChild(element);
      app.animate(element);
    },

    animate: function (element) {
      let character = app.chars[Math.floor(Math.random() * app.chars.length)];
      let duration = Math.floor(Math.random() * 15) + 1;
      let offset = Math.floor(Math.random() * (100 - duration * 2)) + 3;
      let size = 10 + (15 - duration);
      element.style.cssText = 'right:' + offset + 'vw; font-size:' + size + 'px;animation-duration:' + duration + 's';
      element.innerHTML = character;
      (window as any).setTimeout(app.remove, duration * 1000, element);
    },

    remove: function (element) {
      element.parentNode.removeChild(element);
    }
  };

  if (!(window as any).initializeLettersAnimation.interval) {
    app.init();
  }
}

function destroyLettersAnimation() {
    if (typeof (window as any).initializeLettersAnimation !== 'undefined') {
      clearInterval((window as any).initializeLettersAnimation.interval);
      (window as any).initializeLettersAnimation.interval = null;
      const animContainer = document.querySelector('.animation-container');
      if (animContainer) {
        animContainer.remove();
      }
    }
}

@Component({
  selector: 'publiq-letters-animation',
  templateUrl: './letters-animation.component.html'
})
export class LettersAnimationComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      (window as any).initializeLettersAnimation = { interval : null };
      initializeLettersAnimation();
      document.addEventListener('DOMContentLoaded', (window as any).initializeLettersAnimation);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      destroyLettersAnimation();
    }
  }
}
