import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { EmailStatus } from './email-status.entity';

type ChesDocument = {
  contentType: string;
  content: string | ArrayBuffer;
  filename: string;
  encoding: 'base64' | 'binary' | 'hex' | 'utf-8';
};

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private httpService: HttpService,
    @InjectRepository(EmailStatus)
    private repository: Repository<EmailStatus>,
    private documentService: DocumentService,
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

  async getEmailStatus(transactionId: string) {
    const token = await this.getToken();
    const serviceUrl = this.config.get<string>('CHES.URL');

    const res = await firstValueFrom(
      this.httpService.get(
        `${serviceUrl}/api/v1/status?txId=${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    return res.data;
  }

  async sendEmail({
    to,
    body,
    subject,
    cc = [],
    bcc = [],
    parentType,
    parentId,
    triggerStatus,
    attachments = [],
  }: {
    to: string[];
    body: string;
    subject: string;
    cc?: string[];
    bcc?: string[];
    parentType?: string;
    parentId?: string;
    triggerStatus?: string;
    attachments?: Document[];
  }) {
    const serviceUrl = this.config.get<string>('CHES.URL');
    const from = this.config.get<string>('CHES.FROM');
    const token = await this.getToken();

    const preparedAttachments: ChesDocument[] = [];
    for (const attachment of attachments) {
      const fileUrl = await this.documentService.getDownloadUrl(attachment);
      const fileData = await firstValueFrom(
        this.httpService.get(fileUrl, {
          responseType: 'arraybuffer',
        }),
      );

      const encodedData = Buffer.from(fileData.data, 'binary').toString(
        'base64',
      );

      preparedAttachments.push({
        contentType: attachment.mimeType,
        content: encodedData,
        filename: attachment.fileName,
        encoding: 'base64',
      });
    }

    try {
      if (this.config.get<string>('CHES.MODE') !== 'production') {
        this.logger.log(
          { to, body, subject, cc, bcc },
          'EmailService did not send the email. Set CHES.MODE to production if you need to send an email.',
        );
        return;
      }
      const res = await firstValueFrom(
        this.httpService.post<{
          txId: string;
          messages: {
            msgId: string;
            tag: string;
            to: string[];
          }[];
        }>(
          `${serviceUrl}/api/v1/email`,
          {
            bodyType: 'html',
            body,
            from,
            subject,
            to,
            cc,
            bcc,
            attachments: preparedAttachments,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      this.logger.debug({ to, from, subject }, `Email sent`);
      this.repository.save(
        new EmailStatus({
          recipients: [...to, ...cc, ...bcc].join(', '),
          status: 'success',
          transactionId: res.data.txId,
          parentType,
          parentId,
          triggerStatus,
        }),
      );
    } catch (e) {
      this.logger.error(e, 'Failed to Send Email');

      let errorMessage = e.message;
      if (e.response) {
        errorMessage = e.response.data.detail;
      }

      this.repository.save(
        new EmailStatus({
          recipients: [...to, ...cc, ...bcc].join(', '),
          status: 'failed',
          errors: errorMessage,
          parentType,
          parentId,
          triggerStatus,
        }),
      );
    }
  }
}
