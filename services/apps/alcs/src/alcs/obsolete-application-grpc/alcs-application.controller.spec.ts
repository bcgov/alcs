import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { FileNumberService } from '../../file-number/file-number.service';
import { ApplicationGrpcController } from './alcs-application.controller';

describe('ApplicationGrpcController', () => {
  let controller: ApplicationGrpcController;
  let mockFileNumberService: DeepMocked<FileNumberService>;

  beforeEach(async () => {
    mockFileNumberService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        { provide: FileNumberService, useValue: mockFileNumberService },
        {
          provide: ClsService,
          useValue: {},
        },

        ...mockKeyCloakProviders,
      ],
      controllers: [ApplicationGrpcController],
    }).compile();

    controller = module.get<ApplicationGrpcController>(
      ApplicationGrpcController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service on generateNumber', async () => {
    const fileNumber = 'file-id';
    mockFileNumberService.generateNextFileNumber.mockResolvedValue(fileNumber);
    const res = await controller.generateFileNumber({
      ApplicationFileNumberGenerateGrpcRequest: {},
    });

    expect(res).toEqual({ fileNumber });
    expect(mockFileNumberService.generateNextFileNumber).toBeCalledTimes(1);
  });
});
