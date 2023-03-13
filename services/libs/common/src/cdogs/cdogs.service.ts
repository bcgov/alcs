import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import {
  DocumentGenerationModel,
  DocumentGenerationOptions,
  DocumentGenerationTemplate,
} from './cdogs.dto';

@Injectable()
export class CdogsService {
  private logger: Logger = new Logger(CdogsService.name);
  private token = '';
  private tokenExpiry = 0;

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private httpService: HttpService,
  ) {}

  private async fetchToken() {
    const targetUrl = this.config.get<string>('CDOGS.TOKEN_URL');
    const username = this.config.get<string>('CDOGS.SERVICE_CLIENT');
    const password = this.config.get<string>('CDOGS.SERVICE_CLIENT_SECRET');

    const res = await firstValueFrom(
      this.httpService.post(
        `${targetUrl}/auth/realms/comsvcauth/protocol/openid-connect/token`,
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

  private async getTemplateAsBase64(templatePath: string) {
    const filePath = templatePath;
    const fileContent = await fs.promises.readFile(filePath);
    const base64Content = fileContent.toString('base64');
    return base64Content;
  }

  async generateDocument(reportName: string, templatePath: string, data: any) {
    const serviceUrl = this.config.get<string>('CDOGS.URL');
    const token = await this.getToken();

    const content = await this.getTemplateAsBase64(templatePath);

    const payload = new DocumentGenerationModel({
      data,
      options: new DocumentGenerationOptions({ reportName: reportName }),
      template: new DocumentGenerationTemplate({ content }),
    });

    const res = await firstValueFrom(
      this.httpService.post(`${serviceUrl}/api/v2/template/render`, payload, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return res;
  }
}
