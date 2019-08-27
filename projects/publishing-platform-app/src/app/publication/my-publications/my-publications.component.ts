import { Component, OnDestroy, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PublicationService } from '../../core/services/publication.service';
import { AccountService } from '../../core/services/account.service';

import { Publication } from '../../core/services/models/publication';
import { Publications } from '../../core/services/models/publications';

import { ReplaySubject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-publications',
  templateUrl: './my-publications.component.html',
  styleUrls: ['./my-publications.component.scss']
})
export class MyPublicationsComponent implements OnInit, OnDestroy {
  public publications: Publication[];
  public membership: Publication[];
  public invitations: Publication[];
  public requests: Publication[];
  @Input() showCustomModal: boolean = false;
  showModalType = 'invitation';

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    public router: Router,
    public publicationService: PublicationService,
    private accountService: AccountService
  ) {

  }

  set PublicationsData(data: Publications) {
    this.publications = data.owned;
    this.membership = data.membership;
    this.invitations = data.invitations;
    this.requests = data.requests;
  }

  ngOnInit() {
    this.getMyPublications();
  }

  openPublicationModal(flag: boolean, type: string = null) {
    this.showCustomModal = flag;
    this.showModalType = type;
    if (!flag) {
      this.getMyPublications();
    }
  }

  getMyPublications () {
    this.publicationService.getMyPublications()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((data: Publications) => {
      this.PublicationsData = data;
    });
  }

  changeRoute(url) {
    this.router.navigateByUrl(url);
  }

  ngOnDestroy() {

  }
}
