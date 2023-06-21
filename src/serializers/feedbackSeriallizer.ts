import { FeedbackAttributes } from '../interfaces/Feedback';

export const feedbackSerializer = (feedback: FeedbackAttributes) => ({
  id: feedback.id,
  email: feedback.email,
  reason: feedback.reason,
  feedback: feedback.feedback,
  updatedAt: feedback.updatedAt,
  createdAt: feedback.createdAt,
});
