import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { DialogService } from '../../core/services/dialog.service';
import { PublicationService } from '../../core/services/publication.service';
import { Publication } from '../../core/services/models/publication';
import { environment } from '../../../environments/environment';
import { Publications } from '../../core/services/models/publications';

@Component({
  selector: 'app-my-publications',
  templateUrl: './my-publications.component.html',
  styleUrls: [
    './my-publications.component.scss',
    '../../../assets/css/screen.scss'
  ]
})
export class MyPublicationsComponent implements OnInit, OnDestroy {
  publications: Publication[];
  membership: Publication[];
  invitations: Publication[];
  selectedIndex = this.publicationService.tabIndexInv;
  filePath = environment.backend + '/uploads/publications/';
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    public router: Router,
    public dialogService: DialogService,
    public publicationService: PublicationService,
  ) {
  }

  ngOnInit() {
    this.publicationService.getMyPublications2()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: Publications) => {
        this.publications = data.owned;
        this.membership = data.membership;
        this.invitations = data.invitations;
      });


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

    this.publicationService.myMemberships
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: Array<Publication>) => {
        this.membership = data;
      });

    this.publicationService.myInvitations
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (data: Array<Publication>) => {
          this.invitations = data;
        }
      );
    */
  }

  deletePublication(slug, index, e) {
    e.stopPropagation();

    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        switchMap(() => this.publicationService.deletePublication(slug)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.publications.splice(index, 1);
      });
  }

  deleteMembership(slug, index) {
    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        switchMap(() => this.publicationService.deleteMembership(slug)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.publications.splice(index, 1);
      });
  }

  goToDetail(slug, status) {
    this.router.navigate([`/p/${slug}`]);
  }

  invitationResponse(id, accepted) {
    const body = {membershipId: id, accepted: accepted};
    this.publicationService.acceptInvitation(body)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(res => {
        this.publicationService.getMyPublications();
      });
  }

  ngOnDestroy() {
    this.publicationService.tabIndexInv = 0;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
