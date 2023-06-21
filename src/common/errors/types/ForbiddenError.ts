import httpStatus from 'http-status';
import HttpError from './HttpError';
import messages from '../../messages';

export default class ForbiddenError extends HttpError {
  constructor(message = messages.httpMessages[403]) {
    super(message);

    Object.setPrototypeOf(this, ForbiddenError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.FORBIDDEN;
  }
}
