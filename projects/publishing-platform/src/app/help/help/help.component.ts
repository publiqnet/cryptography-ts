import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { StaticContent } from '../models/staticContent';
import { HelpService } from '../services/help.service';



@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['../../../assets/css/screen.scss', './help.component.scss']
})
export class HelpComponent implements OnInit, OnChanges {
  readonly title = 'Help';

  messageList: Array<StaticContent> = [];

  constructor(private helpService: HelpService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.messageList.sort(this.sortByPosition);
  }

  ngOnInit(): void {
    this.helpService
      .getMessages()
      .subscribe(
        (response: Array<StaticContent>) => (this.messageList = response)
      );
  }

  private sortByPosition(previous: StaticContent, next: StaticContent) {
    return next.position - previous.position;
  }
}
