import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';

export class DocumentGenerationOptions {
  constructor(data?: Partial<DocumentGenerationOptions>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  cacheReport = false;
  convertTo = 'pdf';
  overwrite = true;
  reportName: string;
}

export class DocumentGenerationTemplate {
  constructor(data?: Partial<DocumentGenerationTemplate>) {
    if (data) {
      Object.assign(this, data);
    }
  }
  encodingType = 'base64';
  fileType = 'docx';
  content: string;
}

export class DocumentGenerationModel {
  constructor(data?: Partial<DocumentGenerationModel>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  data: any;
  formatters: any = '';
  options: DocumentGenerationOptions;
  template: DocumentGenerationTemplate;
}

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

  async generateDocument(reportName: string, templatePath: string) {
    const serviceUrl = this.config.get<string>('CDOGS.URL');
    const token = await this.getToken();

    const content = await this.getTemplateAsBase64(templatePath);

    const payload = new DocumentGenerationModel({
      data: {
        noData: 'No Data',
        fileNumber: '100009',
        applicant: 'Mekhti Huseinov',
        status: 'In Progress',
        type: 'Non-Farm Use',
        parcels: [
          {
            index: '1',
            uuid: '61daac18-1523-4bbb-8e0d-173c9213a322',
            pid: '014155753',
            pin: null,
            legalDescription:
              'LOT A SECTION 27 TOWNSHIP 23 RANGE 2 WEST OF THE 6TH MERIDIAN KOOTENAY DISTRICT PLAN 6197',
            mapAreaHectares: 0.05,
            isFarm: true,
            isConfirmedByApplicant: false,
            crownLandOwnerType: null,
            parcelType: 'application',
            ownershipTypeCode: 'SMPL',
            ownershipType: 'Fee Simple',
            purchasedDate: '2023-01-01',
            documents: [],
            owners: [
              {
                uuid: 'cf211423-78e6-4617-b580-ff7d32211325',
                firstName: 'Mekhti',
                lastName: 'Huseinov',
                organizationName: null,
                phoneNumber: '1111111111',
                email: 'mekhti@bit3.ca',
                displayName: 'Mekhti Huseinov',
              },
              {
                uuid: '02669170-a639-4eee-bf4a-c7d3a755cdcf',
                firstName: 'Sandra',
                lastName: '2',
                organizationName: null,
                phoneNumber: '1111111111',
                email: '222@bit3.ca',
                displayName: 'Sandra 2',
              },
            ],
          },
          {
            index: '2',
            uuid: '9e2346ba-0138-41b5-af1d-d5eb1c505595',
            pid: '010799303',
            pin: null,
            legalDescription:
              'LOT 7 SECTION 4 TOWNSHIP 24 RANGE 2 WEST OF THE 6TH MERIDIAN KOOTENAY DISTRICT PLAN 10926',
            mapAreaHectares: 0.04,
            isConfirmedByApplicant: false,
            crownLandOwnerType: null,
            parcelType: 'application',
            ownershipTypeCode: 'SMPL',
            documents: [],
            owners: [],
          },
        ],
      },
      options: new DocumentGenerationOptions({ reportName: reportName }),
      template: new DocumentGenerationTemplate({ content }),
    });

    // api/v2/template/render
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
