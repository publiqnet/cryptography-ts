import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { DialogService } from '../../core/services/dialog.service';
import { PublicationService } from '../../core/services/publication.service';
import { Publication } from '../../core/services/models/publication';
import { Publications } from '../../core/services/models/publications';
import { PublicationMemberStatusType } from '../../core/models/enumes';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-my-publications-old',
  templateUrl: './my-publications-old.component.html',
  styleUrls: [
    './my-publications-old.component.scss',
    '../../../assets/css/screen.scss'
  ]
})
export class MyPublicationsOldComponent implements OnInit, OnDestroy {
  publications: Publication[];
  membership: Publication[];
  invitations: Publication[];
  requests: Publication[];
  selectedIndex = this.publicationService.tabIndexInv;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    public router: Router,
    public dialogService: DialogService,
    public publicationService: PublicationService,
    private accountService: AccountService
  ) {
  }

  ngOnInit() {
    this.publicationService.getMyPublications()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: Publications) => this.PublicationsData = data);


    /*this.publicationService.myPublications
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: Array<Publication>) => {
        if (data) {
          data.forEach((pub: any) => {
              if (pub.logo && !pub.cover) {
                this.publicationService.getAverageRGB(pub);
              }
              pub.members = pub.members.filter(m => m.status !== 1);
            }
          );
          this.publications = data;
        }
      });
    */
  }

  set PublicationsData(data: Publications) {
    this.publications = data.owned;
    this.membership = data.membership;
    this.invitations = data.invitations;
    this.requests = data.requests;
  }

  get MemberStatus() {
    return PublicationMemberStatusType;
  }

  deletePublication(slug, index, e) {
    e.stopPropagation();

    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        switchMap(() => this.publicationService.deletePublication(slug)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.publications.splice(index, 1));
  }

  deleteMembership(slug, index) {
    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        switchMap(() => this.publicationService.deleteMembership(slug)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.publications.splice(index, 1));
  }

  // invitationResponse(id, accepted) {
  //   const body = {membershipId: id, accepted: accepted};
  //   this.publicationService.acceptInvitation(body)
  //     .pipe(
  //       switchMap(() => this.publicationService.getMyPublications()),
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((data: Publications) =>  this.PublicationsData = data);
  // }

  acceptInvitationBecomeMember(slug: string) {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    }
    this.publicationService.acceptInvitationBecomeMember(slug)
      .pipe(
        switchMap(() => this.publicationService.getMyPublications()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: Publications) =>  this.PublicationsData = data);
  }

  rejectInvitationBecomeMember(slug: string) {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    }
    this.publicationService.rejectInvitationBecomeMember(slug)
      .pipe(
        switchMap(() => this.publicationService.getMyPublications()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: Publications) =>  this.PublicationsData = data);
  }

  cancelRequestBecomeMember(publication: Publication) {
    this.publicationService.cancelBecomeMember(publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => publication.memberStatus = this.MemberStatus.no_info);
  }

  ngOnDestroy() {
    this.publicationService.tabIndexInv = 0;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
