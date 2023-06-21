import httpStatus from 'http-status';
import messages from '../../messages';
import HttpError from './HttpError';

export default class UnauthorizedError extends HttpError {
  constructor(message = messages.httpMessages[401]) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.UNAUTHORIZED;
  }
}
