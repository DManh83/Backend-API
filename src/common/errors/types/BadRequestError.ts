import httpStatus from 'http-status';
import messages from '../../messages';
import HttpError from './HttpError';

export default class BadRequestError extends HttpError {
  constructor(message = messages.httpMessages[400]) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.BAD_REQUEST;
  }
}
