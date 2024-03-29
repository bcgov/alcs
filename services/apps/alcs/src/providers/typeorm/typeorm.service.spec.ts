import { ConfigModule } from '@app/common/config/config.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeormConfigService } from './typeorm.service';

describe('TypeormConfigService', () => {
  let service: TypeormConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [TypeormConfigService],
    }).compile();

    service = module.get<TypeormConfigService>(TypeormConfigService);
  });

  it('TypeormConfigService should be defined', () => {
    expect(service).toBeDefined();
  });
});
