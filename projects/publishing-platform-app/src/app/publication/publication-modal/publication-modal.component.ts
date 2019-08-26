import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { ReplaySubject, of } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PublicationService } from '../../core/services/publication.service';
import { takeUntil, tap, delay } from 'rxjs/operators';
import { ValidationService } from '../../core/validator/validator.service';

@Component({
  selector: 'app-publication-modal',
  templateUrl: './publication-modal.component.html',
  styleUrls: ['./publication-modal.component.scss']
})
export class PublicationModalComponent implements OnInit, OnDestroy {
  @Output() onCloseModal = new EventEmitter<boolean>();
  @Input() modalType: string;
  @Input() invitations = [];
  public publicationForm: FormGroup;
  public titleMaxLenght = 120;
  coverImage: any;
  logoImage: any;
  coverFile: File;
  logoFile: File;
  loading = false;
  slug: string;
  fileUploadError: string;
  private unsubscribe$ = new ReplaySubject<void>(1);

  public invitationData = {
    'title': 'UX Topics',
    'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
    'logo': 'http://via.placeholder.com/120x120',
    'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'slug': 'ux_topics',
    'subscribers': 1234,
    'following': false,
    'inviter': {
      'name': 'Anechka'
    },
    'status': 0,
    'storiesCount': 0,
    'membersList': [
      {
        'slug': '1.0.2',
        'first_name': 'test 1',
        'last_name': 'A',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 2',
        'last_name': 'B',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 3',
        'last_name': 'C',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 4',
        'last_name': 'D',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 5',
        'last_name': 'E',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 6',
        'last_name': 'G',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      }
    ]
  };


  constructor(private FormBuilder: FormBuilder,
    private publicationService: PublicationService) {
    this.buildForm();
  }

  ngOnInit() {
  }

  closePopup(close: boolean) {
    this.publicationForm.reset();
    this.logoImage = null;
    this.coverImage = null;
    this.onCloseModal.emit(close);
  }

  onSubmit() {
    if (this.publicationForm.invalid) {
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.publicationForm.value.title);
    formData.append('description', this.publicationForm.value.description);
    if (this.coverFile) {
      formData.append('cover', this.coverFile, this.coverFile.name);
    }
    if (this.logoFile) {
      formData.append('logo', this.logoFile, this.logoFile.name);
    }
    // tagsy poxel
    console.log(this.publicationForm.value, this.publicationForm.value.tags.split([',']));
    if (this.publicationForm.value.tags.length) {
      formData.append('tags', this.publicationForm.value.tags.split([',']));
    }
      this.publicationService.createPublication(formData)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this.loading = false;
          this.closePopup(false);
        }, () => this.loading = false);
  }

  validateFile(file, size) {
    if ((file.type !== 'image/jpeg' && file.type !== 'image/png') || file.size > size) {
      of('Invalid file size or extension')
        .pipe(
          tap((msg) => this.fileUploadError = msg),
          delay(3000),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => this.fileUploadError = null);
      return;
    }
    return true;
  }

  selectCover(e) {
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!this.validateFile(file, 2000000)) {
      e.target.value = '';
      return;
    }

    reader.addEventListener(
      'load',
      () => {
        this.coverImage = reader.result;
        this.coverFile = file;
      },
      false
    );
    reader.readAsDataURL(file);
  }

  selectLogo(e) {
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!this.validateFile(file, 1000000)) {
      e.target.value = '';
      return;
    }

    reader.addEventListener(
      'load',
      () => {
        this.logoImage = reader.result;
        this.logoFile = file;
      },
      false
    );
    reader.readAsDataURL(file);
  }

  removeCover(coverInput) {
    this.coverImage = null;
    this.coverFile = null;
    this.publicationForm.controls['cover'].reset();
  }

  removeLogo(logoInput) {
    this.logoImage = null;
    this.logoFile = null;
    this.publicationForm.controls['logo'].reset();
  }

  answer(e, i) {
    if (e.answer) {
      this.publicationService.acceptInvitationBecomeMember(e.publicationSlug).subscribe(
        () => {
          this.invitations.splice(i, 1);
        }
      );
    } else {
      this.publicationService.rejectInvitationBecomeMember(e.publicationSlug).subscribe(
        () => {
          this.invitations.splice(i, 1);
        }
      );
    }
  }

  private buildForm(): void {
    this.publicationForm = this.FormBuilder.group({
      description: new FormControl('', [ValidationService.required, Validators.maxLength(160)]),
      title: new FormControl('', [ValidationService.required, Validators.maxLength(this.titleMaxLenght)]),
      cover: new FormControl(),
      logo: new FormControl(),
      tags: new FormControl('')
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
