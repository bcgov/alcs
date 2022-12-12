import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private httpService: HttpService,
  ) {}

  private token = '';
  private tokenExpiry = 0;

  private async fetchToken() {
    const targetUrl = this.config.get<string>('CHES.TOKEN_URL');
    const username = this.config.get<string>('CHES.SERVICE_CLIENT');
    const password = this.config.get<string>('CHES.PASSWORD');

    const res = await firstValueFrom(
      this.httpService.post(
        targetUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
        }),
        {
          auth: {
            username,
            password,
          },
        },
      ),
    );

    this.token = res.data.access_token;
    this.tokenExpiry = Date.now() + res.data.expires_in - 1;

    return this.token;
  }

  private async getToken() {
    if (this.tokenExpiry < Date.now()) {
      return this.fetchToken();
    } else {
      return this.token;
    }
  }

  async sendEmail({
    to,
    body,
    subject,
    cc = [],
    bcc = [],
  }: {
    to: string[];
    body: string;
    subject: string;
    cc?: string[];
    bcc?: string[];
  }) {
    const serviceUrl = this.config.get<string>('CHES.URL');
    const from = this.config.get<string>('CHES.FROM');
    const token = await this.getToken();

    try {
      if (this.config.get<string>('CHES.MODE') !== 'production') {
        this.logger.log(
          { to, body, subject, cc, bcc },
          'EmailService did not send the email. Set CHES.MODE to production if you need to send an email.',
        );
        return;
      }
      const res = await firstValueFrom(
        this.httpService.post(
          `${serviceUrl}/api/v1/email`,
          {
            bodyType: 'html',
            body,
            from,
            subject,
            to,
            cc,
            bcc,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      this.logger.debug({ to, from, subject }, `Email sent`);
    } catch (e) {
      this.logger.error(e, 'Failed to Send Email');
    }
  }
}
