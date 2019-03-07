export interface Draft {
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
}
