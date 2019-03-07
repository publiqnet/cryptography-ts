import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';

import { Broadcaster } from '../../broadcaster/broadcaster';
import { TagDetailObject } from '../models/classes/tag.detail.object';
import { TagService } from '../services/tag.service';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {
  @Output() tagevent = new EventEmitter();
  tags: TagDetailObject[] = [];
  tagsSubscription: Subscription = Subscription.EMPTY;

  constructor(
    public router: Router,
    private broadcaster: Broadcaster,
    @Inject(PLATFORM_ID) private platformId: Object,
    private tagService: TagService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.tagService.loadTags('', 0, 100);

      this.tags = this.tagService.getTags();

      this.tagsSubscription = this.tagService.tagsChanged.subscribe(
        (tags: TagDetailObject[]) => {
          this.tags = tags;
        }
      );
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';

      this.tagsSubscription.unsubscribe();
    }
  }

  tagListToggle(tag) {
    this.tagevent.emit(1);
    this.broadcaster.broadcast('searchTags', tag.name);
    this.tagsSubscription.unsubscribe();
  }
}
