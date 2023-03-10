import { ConfigModule } from '@app/common/config/config.module';
import { createMock } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import * as fs from 'fs';
import { of } from 'rxjs';
import { DocumentGenerationModel } from './cdogs.dto';
import { CdogsService } from './cdogs.service';

describe('CdogsService', () => {
  let service: CdogsService;
  let mockHttpService;
  const templatePath = 'path/to/template';

  beforeEach(async () => {
    mockHttpService = createMock<HttpService>();
    jest.mock('fs');
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        CdogsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CdogsService>(CdogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get token and call email service in happy path', async () => {
    // Mock the fs.promises.readFile method
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue('template-content');

    const httpResponse: any = {
      data: 'generated-document',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    mockHttpService.post.mockReturnValueOnce(
      of({
        data: {
          expires_in: 300,
          access_token: 'fake-token',
        },
      }),
    );
    mockHttpService.post.mockReturnValueOnce(of(httpResponse));

    const result = await service.generateDocument(
      'report-name',
      templatePath,
      {},
    );
    expect(mockHttpService.post).toHaveBeenCalledTimes(2);
    const authUrl = mockHttpService.post.mock.calls[0][0];
    expect(authUrl).toEqual(
      `${config.get(
        'CDOGS.TOKEN_URL',
      )}/auth/realms/comsvcauth/protocol/openid-connect/token`,
    );

    expect(fs.promises.readFile).toHaveBeenCalledWith(templatePath);
    expect(mockHttpService.post).toHaveBeenCalledWith(
      'https://cdogs-dev.api.gov.bc.ca/api/v2/template/render',
      expect.any(DocumentGenerationModel),
      expect.objectContaining({
        responseType: 'arraybuffer',
      }),
    );
    expect(result).toEqual(httpResponse);
  });

  it('should re-use the token if its  not expired', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue('template-content');
    mockHttpService.post.mockReturnValueOnce(
      of({
        data: {
          expires_in: 300,
          access_token: 'fake-token',
        },
      }),
    );
    mockHttpService.post.mockReturnValueOnce(of({}));
    mockHttpService.post.mockReturnValueOnce(of({}));

    await service.generateDocument('report-name', templatePath, {});
    await service.generateDocument('report-name', templatePath, {});

    expect(mockHttpService.post).toHaveBeenCalledTimes(3);
  });
});
