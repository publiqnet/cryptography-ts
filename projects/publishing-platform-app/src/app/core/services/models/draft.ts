import { reference } from '@angular/core/src/render3';

export interface Draft { // todo delete
  id?: number;
  title: string;
  headline: string;
  tags: Array<string>;
  coverImages: Array<string>;
  mainCoverImageUrl: string;
  mainCoverImageChecker: boolean;
  listImages: Array<string>;
  mainListImageUrl: string;
  listImageChecker: boolean;
  content: string;
  lastModifiedDate: number;
  sourceOfMaterial: string;
  reference: string;
  forAdults: boolean;
  contentId: number;
  publication: string;
  contentUris: Array<any>;
}

export interface IDraft {
  content: string;
  forAdults: boolean;
  headline: string;
  reference: string;
  sourceOfMaterial: string;
  title: string;
  id?: string;
  created?: string;
  updated?: string;
  publication?: string;
  contentUris: Array<any>;
}

export class DraftData {
  content: string;
  forAdults: boolean;
  headline: string;
  reference: string;
  sourceOfMaterial: string;
  title: string;
  id: number;
  publication?: string;
  created: Date;
  updated: Date;

  constructor(data: IDraft) {
    for (const i in data) {
      if (data.hasOwnProperty(i)) {
        if (['created', 'updated'].includes(i)) {
          this[i] = new Date(data[i]);
        } else {
          this[i] = data[i];
        }
      }
    }
  }
}

