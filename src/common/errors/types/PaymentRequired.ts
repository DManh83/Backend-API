import httpStatus from 'http-status';
import messages from '../../messages';
import HttpError from './HttpError';

export default class PaymentRequired extends HttpError {
  constructor(message = messages.httpMessages[402]) {
    super(message);

    Object.setPrototypeOf(this, PaymentRequired.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.PAYMENT_REQUIRED;
  }
}
