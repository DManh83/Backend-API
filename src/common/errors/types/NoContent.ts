import httpStatus from 'http-status';
import messages from '../../messages';
import HttpError from './HttpError';

export default class NoContentFound extends HttpError {
  constructor(message = messages.httpMessages[204]) {
    super(message);

    Object.setPrototypeOf(this, NoContentFound.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.NO_CONTENT;
  }
}
