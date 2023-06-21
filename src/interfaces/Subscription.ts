import { ProductType } from '../common/enum';

export interface CreateSubscriptionParams {
  priceId: string;
  paymentMethodId?: string;
  productType: ProductType;
}

export interface SubScriptionAttributes {
  id: string;
  userId: string;
  subscriptionId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  record: Object;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubscriptionCreation = Omit<SubScriptionAttributes, 'id'>;

export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export interface UpdateSubscriptionParams {
  cancelAtPeriodEnd?: boolean;
}

export interface CreateAppleSubscription {
  subscriptionId: string;
  record: any;
}
