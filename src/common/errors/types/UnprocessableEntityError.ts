import httpStatus from 'http-status';
import messages from '../../messages';
import HttpError from './HttpError';

export default class UnprocessableEntityError extends HttpError {
  constructor(message = messages.httpMessages[422]) {
    super(message);

    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.UNPROCESSABLE_ENTITY;
  }
}
