import nodemailer from 'nodemailer';
import path from 'path';
import EmailTemplate from 'email-templates';
import config from '../../../config/env';
import messages from '../messages';
import { logger } from '../helpers/logger';
import InternalServerError from '../errors/types/InternalServerError';
import { API_PREFIX, FILE_PREFIX } from '../constants';

interface IMailServer {
  mailServer: string;
  mailPort: string;
  mailAuthUserName: string;
  mailAuthPassword: string;
  senderEmail: string;
  senderName: string;
}

interface IMail {
  from: string;
  to: string;
  subject: string;
  template: string;
  data: any;
}

interface IMailTemplate {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const emailTemplateDir = path.resolve('src/common/email-template');

class Mail {
  private smtpTransport: any;

  private mailServerInfo: IMailServer;

  constructor(mailInfo: IMailServer) {
    this.mailServerInfo = mailInfo;
    this.initializeMailService(mailInfo);
  }

  private initializeMailService(mailInfo: IMailServer) {
    const smtpTransport = nodemailer.createTransport({
      host: mailInfo.mailServer,
      port: Number(mailInfo.mailPort),
      auth: {
        user: mailInfo.mailAuthUserName,
        pass: mailInfo.mailAuthPassword,
      },
    });
    this.smtpTransport = smtpTransport;
  }

  public async requestSendMail(mail): Promise<string> {
    if (!mail.from) {
      mail.from = `${this.mailServerInfo.senderName} <${this.mailServerInfo.senderEmail}>`;
    }
    const template = new EmailTemplate();
    const results = await template.render(path.join(emailTemplateDir, mail.template), {
      ...mail.data,
      logoBrandUrl: `${config.apiUrl}${API_PREFIX}${FILE_PREFIX}/static/logo-brand.png`,
      supportPageUrl: config.supportPageUrl,
    });
    const sendStatus = await this.send({
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      html: results,
    });
    return sendStatus;
  }

  private send(mail: IMailTemplate): Promise<string> {
    return new Promise((resolve, reject) => {
      this.smtpTransport.sendMail(mail, (error: Error, info) => {
        if (error) {
          logger.error(error);
          return reject(new InternalServerError(`${messages.mail.sendError}. ${JSON.stringify(error)}`));
        }
        resolve(`Message sent: ${info.response}`);
      });
    });
  }
}

export default new Mail({
  mailServer: config.mailServer,
  mailPort: config.mailPort,
  mailAuthUserName: config.mailAuthUserName,
  mailAuthPassword: config.mailAuthPassword,
  senderEmail: config.senderEmail,
  senderName: config.senderName,
} as IMailServer);
