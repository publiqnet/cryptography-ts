import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { Observable, Subject, Subscription, merge, fromEvent, from, interval, timer, of } from 'rxjs';
import { bufferTime, filter, switchMap, takeUntil, tap, finalize, distinctUntilChanged, map, take, scan } from 'rxjs/operators';

import { UserIdleServiceConfig } from './user-idle.config';
import { isPlatformBrowser } from '@angular/common';

/**
 * User's idle service.
 */
@Injectable()
export class UserIdleService {
  ping$: Observable<any>;

  /**
   * Events that can interrupts user's inactivity timer.
   */
  private readonly activityEvents$: Observable<any>;

  private timerStart$ = new Subject<boolean>();
  private timeout$ = new Subject<boolean>();
  private idle$: Observable<any>;
  private timer$: Observable<any>;
  /**
   * Idle value in seconds.
   * Default equals to 10 minutes.
   */
  private idle = 600;
  /**
   * Timeout value in seconds.
   * Default equals to 5 minutes.
   */
  private timeout = 300;
  /**
   * Ping value in seconds.
   */
  private ping = 120;
  /**
   * Timeout status.
   */
  private isTimeout: boolean;
  /**
   * Timer of user's inactivity is in progress.
   */
  private isInactivityTimer: boolean;

  private idleSubscription: Subscription;

  constructor(@Optional() config: UserIdleServiceConfig, @Inject(PLATFORM_ID) private platformId: Object) {
    if (config) {
      this.idle = config.idle;
      this.timeout = config.timeout;
      this.ping = config.ping;
    }

      if (isPlatformBrowser(this.platformId)) {
          // console.log('window console', window);
          this.activityEvents$ = merge(
              fromEvent(window, 'mousemove'),
              fromEvent(window, 'resize'),
              fromEvent(document, 'keydown'));

          this.idle$ = from(this.activityEvents$);
      }

  }

  /**
   * Start watching for user idle and setup timer and ping.
   */
  startWatching() {
    /**
     * If any of user events is not active for idle-seconds when start timer.
     */
    this.idleSubscription = this.idle$
      .pipe(bufferTime(5000))  // Starting point of detecting of user's inactivity
      .pipe(filter(arr => !arr.length && !this.isInactivityTimer))
      .pipe(switchMap(() => {
        this.isInactivityTimer = true;
        return interval(1000)
          .pipe(takeUntil(merge(
            this.activityEvents$,
            timer(this.idle * 1000)
              .pipe(tap(() => this.timerStart$.next(true))))))
          .pipe(finalize(() => this.isInactivityTimer = false));
      }))
      .subscribe();

    this.setupTimer(this.timeout);
    this.setupPing(this.ping);
  }

  stopWatching() {
    this.stopTimer();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

  stopTimer() {
    this.timerStart$.next(false);
  }

  resetTimer() {
    this.stopTimer();
    this.isTimeout = false;
  }

  /**
   * Return observable for timer's countdown number that emits after idle.
   * @return {Observable<number>}
   */
  onTimerStart(): Observable<number> {
    return this.timerStart$
      .pipe(distinctUntilChanged())
      .pipe(switchMap(start => start ? this.timer$ : of(null)));
  }

  /**
   * Return observable for timeout is fired.
   * @return {Observable<boolean>}
   */
  onTimeout(): Observable<boolean> {
    return this.timeout$
      .pipe(filter(timeout => !!timeout))
      .pipe(map(() => {
        this.isTimeout = true;
        return true;
      }));
  }

  getConfigValue(): UserIdleServiceConfig {
    return {
      idle: this.idle,
      timeout: this.timeout,
      ping: this.ping
    };
  }

  /**
   * Setup timer.
   *
   * Counts every seconds and return n+1 and fire timeout for last count.
   * @param timeout Timeout in seconds.
   */
  private setupTimer(timeout: number) {
    this.timer$ = interval(1000)
      .pipe(take(timeout))
      .pipe(map(() => 1))
      .pipe(scan((acc, n) => acc + n))
      .pipe(map(count => {
        if (count === timeout) {
          this.timeout$.next(true);
        }
        return count;
      }));
  }

  /**
   * Setup ping.
   *
   * Pings every ping-seconds only if is not timeout.
   * @param {number} ping
   */
  private setupPing(ping: number) {
    this.ping$ = interval(ping * 1000).pipe(filter(() => !this.isTimeout));
  }
}
