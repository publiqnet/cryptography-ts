import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

// pure: false is needed to detect translation changes
@Pipe({
  name: 'timeinterval',
  pure: false
})
export class TimeIntervalPipe implements PipeTransform {
  constructor(private datePipe: DatePipe, private t: TranslateService) { }

  transform(value: string): string {
    const interval = this.getInterval(value);

    if (interval.title === 'datetime') {
      // this.datePipe.transform(value, `d MMM, yyyy, hh:mm`);
      return `${this.datePipe.transform(value, 'd')} ${this.t.instant('months.' + this.datePipe.transform(value, 'MMM'))}, ${this.datePipe.transform(value, 'yyyy')}, ${this.datePipe.transform(value, 'hh:mm')}`;
    } else if (interval.title === 'yesterday') {
      return this.t.instant('notifications.yesterday', { time: this.datePipe.transform(value, 'hh:mm') });
    } else if (interval.title === 'hr') {
      return this.t.instant('notifications.h_ago', { count: interval.time });
    } else if (interval.title === 'minute') {
      return this.t.instant('notifications.m_ago', { count: interval.time });
    } else if (interval.title === 'now') {
      return this.t.instant('notifications.just_now');
    }
  }

  getInterval(lastActivity): { time: number; title: string } {
    let result = { time: -1, title: null };
    const oneDay = 1000 * 60 * 60 * 24;
    const oneHour = 1000 * 60 * 60;
    const oneMinute = 1000 * 60;

    if (!lastActivity) {
      return result;
    }

    const now = new Date().getTime();
    const ms = new Date(lastActivity).getTime();
    const d = now - ms,
      dd = Math.floor(d / oneDay),
      h = Math.floor(d / oneHour),
      mm = Math.floor(d / oneMinute);

    // activity result
    if (d) {
      if (dd > 1) {
        result = { time: 0, title: 'datetime' };
      } else if (dd > 0) {
        result = { time: 0, title: 'yesterday' };
      } else if (h > 0) {
        result = { time: h, title: 'hr' };
      } else if (mm > 1) {
        result = { time: mm, title: 'minute' };
      } else {
        result = { time: 1, title: 'now' };
      }
    }

    return result;
  }
}
