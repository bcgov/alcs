import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { CONFIG_TOKEN } from '../../common/config/config.module';
import { LocalGovernmentService } from './local-government.service';

describe('LocalGovernmentService', () => {
  let service: LocalGovernmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalGovernmentService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<LocalGovernmentService>(LocalGovernmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call out to ALCS to get Local Governments', async () => {
    //TODO
  });
});
