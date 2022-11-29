import { Test, TestingModule } from '@nestjs/testing';
import * as config from 'config';
import { CONFIG_TOKEN } from '../../common/config/config.module';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call out to ALCS for creation', async () => {
    //TODO
  });

  it('should call out to ALCS for deletion', async () => {
    //TODO
  });
});
