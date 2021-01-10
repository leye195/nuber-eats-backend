import { Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions, EmailVar } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS)
    private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    to: string,
    emailVars: EmailVar[],
  ) {
    try {
      const form = new FormData();
      form.append(
        'from',
        `Dan from Nuber Eats <mailgun@${this.options.domain}>`,
      );
      form.append('to', to);
      form.append('subject', subject);
      form.append('template', template);
      emailVars.forEach(({ key, value }) => form.append(`v:${key}`, value));

      const response = await got(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          method: 'POST',
          body: form,
        },
      );
      console.log(response.body);
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify_email', email, [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
