import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { DialogService } from '../../core/services/dialog.service';
import { PublicationService } from '../../core/services/publication.service';
import { Publication } from '../../core/services/models/publication';
import { environment } from '../../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-my-publications',
  templateUrl: './my-publications.component.html',
  styleUrls: [
    './my-publications.component.scss',
    '../../../assets/css/screen.scss'
  ]
})
export class MyPublicationsComponent implements OnInit, OnDestroy {
  publications: Array<Publication>;
  membership: Array<Publication>;
  invitations: Array<Publication>;
  selectedIndex = this.publicationService.tabIndexInv;
  filePath = environment.backend + '/uploads/publications/';
  coverColor = 'blue';
  private unsubscribe$: Subject<void> = new Subject<void>();
  subscriptions: Subscription = new Subscription();

  constructor(
    public router: Router,
    public dialogService: DialogService,
    public publicationService: PublicationService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        this.publicationService.getMyPublications();
        this.publicationService.myPublications.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(
            (data: Array<Publication>) => {
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
            }
        );

        this.publicationService.myMemberships.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(
            (data: Array<Publication>) => {
                this.membership = data;
            }
        );
        this.publicationService.myInvitations.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(
            (data: Array<Publication>) => {
                this.invitations = data;
            }
        );

        this.subscriptions.add(this.publicationService.averageRGBChanged.subscribe(data => {
            this.publications.forEach(pub => {
                if (pub.slug === data.slug) {
                    // @ts-ignore
                    pub.coverColor = data.color;
                }
            });
        }));
    }
  }

  deletePublication(slug, index, e) {
    e.stopPropagation();
    this.dialogService.openConfirmDialog('').subscribe(result => {
      if (result) {
        this.publicationService.deletePublication(slug).subscribe(res => {
          this.publications.splice(index, 1);
        });
      }
    });
  }

  deleteMembership(slug, index) {
    this.dialogService.openConfirmDialog('').subscribe(result => {
      if (result) {
        this.publicationService.deleteMembership(slug).subscribe(res => {
          this.membership.splice(index, 1);
        });
      }
    });
  }

  goToDetail(slug, status) {
    this.router.navigate([`/p/${slug}`]);
  }

  invitationResponse(id, accepted) {
    const body = { membershipId: id, accepted: accepted };
    this.publicationService.acceptInvitation(body).subscribe(res => {
      this.publicationService.getMyPublications();
    });
  }

  ngOnDestroy() {
    this.publicationService.tabIndexInv = 0;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.subscriptions.unsubscribe();
  }


}
