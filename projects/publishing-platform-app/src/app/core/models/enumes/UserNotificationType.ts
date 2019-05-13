// this list should probably come from be
export enum UserNotificationType {
  NEW_ARTICLE = 'new_article',
  REPORTED_ARTICLE = 'article_reported',
  NEW_TRANSFER = 'new_transfer',
  PUBLICATION_REQUESTS = 'publication_request_new',
  PUBLICATION_REQUEST_CANCELLED = 'publication_request_cancelled',
  PUBLICATION_REQUEST_ACCEPTED = 'publication_request_accepted',
  PUBLICATION_REQUEST_REJECTED = 'publication_request_rejected',
  PUBLICATION_INVITATION_ACCEPTED = 'publication_invitation_accepted',
  PUBLICATION_INVITATION_REJECTED = 'publication_invitation_rejected',
  PUBLICATION_INVITATION_NEW = 'publication_invitation_new',
  PUBLICATION_INVITATION_CANCELLED = 'publication_invitation_cancelled',
  PUBLICATION_NEW_ARTICLE = 'publication_new_article',
  PUBLICATION_MEMBERSHIP_CANCELLED = 'publication_membership_cancelled',
  LEFT_PUBLICATION = 'publication_membership_cancelled_by_user'
}
