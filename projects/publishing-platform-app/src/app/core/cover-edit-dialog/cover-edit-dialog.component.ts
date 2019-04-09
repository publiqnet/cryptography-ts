import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { CropperSettings, ImageCropperComponent, CropperDrawSettings } from 'ngx-img-cropper';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ErrorService, ErrorEvent } from '../services/error.service';
import { NotificationService } from '../services/notification.service';
import { ContentService } from '../services/content.service';


@Component({
  selector: 'app-cover-edit-dialog',
  templateUrl: 'cover-edit-dialog.component.html',
  styleUrls: ['cover-edit-dialog.component.scss'],
})
export class CoverEditDialogComponent implements OnInit, OnDestroy {
  editData;
  config = {};
  cropping = false;

  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

  data: any;
  cropperSettings: CropperSettings;
  croppedImageURL = '';
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    public dialogRef: MatDialogRef<CoverEditDialogComponent>,
    private contentService: ContentService,
    private notificationService: NotificationService,
    private errorService: ErrorService) {
  }

  static b64toBlob(b64Data, contentType, sliceSize?) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  }

  ngOnInit(): void {
    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
        if (data.action === 'getImage') {
          this.notificationService.error(data.message);
          this.cropping = false;
          this.dialogRef.close(false);
        }
      });

    this.contentService.uploadCroppedMainPhotoDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
          if (data) {
            this.dialogRef.close([true, data]);
          }
        }
      );

    if (this.editData && this.editData.imageUrl) {
      this.generateCropperSettings();
      this.loadImage(this.editData.imageUrl);
    }
  }

  generateCropperSettings() {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.noFileInput = true;

    this.cropperSettings.canvasWidth = 960;
    this.cropperSettings.cropperClass = 'main-canvas';
    this.cropperSettings.minWidth = 1600;
    this.cropperSettings.minHeight = 600;
    this.cropperSettings.width = 1600;
    this.cropperSettings.height = 600;
    this.cropperSettings.croppedWidth = 1600;
    this.cropperSettings.croppedHeight = 600;
    this.cropperSettings.dynamicSizing = true;
    this.cropperSettings.centerTouchRadius = 300;
    this.cropperSettings.cropperDrawSettings = {
      strokeColor: 'rgb(51, 102,255)',
      dragIconStrokeWidth: 0
    } as CropperDrawSettings;

    this.data = {};
  }

  loadImage(imageUrl) {
    this.contentService.getImage(imageUrl)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: File) => {
        if (data) {
          const image: any = new Image();
          const file: File = data;
          const myReader: FileReader = new FileReader();
          myReader.onloadend = (loadEvent: any) => {
            image.src = loadEvent.target.result;
            setTimeout(() => {
              this.cropper.setImage(image);
            }, 100);
          };
          myReader.onerror = () => {
            this.errorService.handleError('getImage', {status: 404}, imageUrl);
          };

          myReader.readAsDataURL(file);
        } else {
          this.errorService.handleError('getImage', {status: 404}, imageUrl);
        }
      }, error => {
        this.errorService.handleError('getImage', {status: 404}, imageUrl);
      });
  }

  cropImage() {
    this.cropping = true;
    this.croppedImageURL = this.cropper.cropper.getCroppedImage().src;
    const block = this.croppedImageURL.split(';');
    const contentType = block[0].split(':')[1]; // In this case "image/gif"
    const realData = block[1].split(',')[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
    let file = CoverEditDialogComponent.b64toBlob(realData, contentType);

    let extension = this.editData.imageUrl.split('.').pop();
    if (extension.includes('?')) {
      extension = extension.split('?')[0];
    }
    file = this.blobToFile(file, 'cropped_image.' + extension);
    this.contentService.uploadCroppedMainPhoto(file, this.editData.contentId, this.editData.imageUrl);
  }

  blobToFile(theBlob, fileName) {
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  }

  onCloseCancel() {
    this.dialogRef.close(false);
    return false;
  }

  onCloseConfirm() {
    this.dialogRef.close(true);
    return true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
