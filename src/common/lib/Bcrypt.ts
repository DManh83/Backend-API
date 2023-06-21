import bcrypt from 'bcrypt';
import config from '../../../config/env';

class Bcrypt {
  private salt: string;

  constructor(salt: string) {
    this.salt = salt;
  }

  /**
   * @param  {string} password
   * @returns string
   */
  public generateHashPassword(password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(this.salt)));
  }

  /**
   * @param  {string} newPass
   * @param  {string} currentPass
   * @returns boolean
   */
  public comparePassword(newPass: string, currentPass: string): boolean {
    return bcrypt.compareSync(newPass, currentPass);
  }
}

export default new Bcrypt(config.salt);
