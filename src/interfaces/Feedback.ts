export interface FeedbackAttributes {
  id: string;
  email: string;
  reason: string;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FeedbackCreation = Omit<FeedbackAttributes, 'id'>;

export interface CreateFeedbackParams {
  email: string;
  reason: string;
  feedback?: string;
}
