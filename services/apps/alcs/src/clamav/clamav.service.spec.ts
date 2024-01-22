import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as NodeClam from 'clamscan';
import * as config from 'config';
import { ClamAVService } from './clamav.service';

jest.mock('clamscan');

describe('ClamAVService', () => {
  let service: ClamAVService;
  let mockHttpClient: DeepMocked<HttpService>;

  beforeEach(async () => {
    mockHttpClient = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClamAVService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: HttpService,
          useValue: mockHttpClient,
        },
      ],
    }).compile();

    service = module.get<ClamAVService>(ClamAVService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(NodeClam).toHaveBeenCalledTimes(1);
  });
});
