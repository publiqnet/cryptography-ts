export interface FeedbackOptions {
  like?;
  report?;
}

export class Feedback {
  like;
  report;

  constructor(options?: FeedbackOptions) {
    if (options && options.hasOwnProperty('like')) {
      this.like = options.like;
    }

    if (options && options.hasOwnProperty('report')) {
      this.report = options.report;
    }
  }
}
