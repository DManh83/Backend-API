import httpStatus from 'http-status';
import messages from '../../messages';
import HttpError from './HttpError';

export default class InternalServerError extends HttpError {
  constructor(message = messages.httpMessages[500]) {
    super(message);

    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }
}
