import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name);

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private readonly httpService: HttpService,
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
