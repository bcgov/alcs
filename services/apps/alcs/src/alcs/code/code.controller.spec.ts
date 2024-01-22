import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { CodeController } from './code.controller';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { CodeService } from './code.service';

describe('CodeController', () => {
  let controller: CodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [CodeController],
      providers: [
        {
          provide: CodeService,
          useValue: createMock<CodeService>(),
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<CodeController>(CodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
