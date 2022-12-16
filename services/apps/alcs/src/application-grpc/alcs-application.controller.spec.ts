import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ApplicationLocalGovernment } from '../application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentService } from '../application/application-document/application-document.service';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { AlcsApplicationProfile } from '../common/automapper/grpc/application.automapper.profile';
import { ApplicationGrpcController } from './alcs-application.controller';
import {
  ApplicationCreateGrpcRequest,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';

describe('ApplicationGrpcController', () => {
  let controller: ApplicationGrpcController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockApplicationDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockLocalGovernmentService = createMock();
    mockApplicationDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        { provide: ApplicationService, useValue: mockApplicationService },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockApplicationDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        AlcsApplicationProfile,
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

  it('should call through to service', async () => {
    const mockFileNumber = 'mock';
    const mockTypeCode = 'mockType';
    mockLocalGovernmentService.getByUuid.mockResolvedValue({
      preferredRegion: { code: 'test' },
    } as ApplicationLocalGovernment);
    mockApplicationService.create.mockResolvedValue({
      fileNumber: mockFileNumber,
      type: { code: mockTypeCode },
    } as Application);
    mockApplicationDocumentService.attachExternalDocuments.mockResolvedValue(
      [],
    );

    const res = await controller.create({} as ApplicationCreateGrpcRequest);

    expect(mockApplicationService.create).toBeCalledTimes(1);
    expect(mockLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(
      mockApplicationDocumentService.attachExternalDocuments,
    ).toBeCalledTimes(1);
    expect(res).toEqual({
      typeCode: mockTypeCode,
      fileNumber: mockFileNumber,
    } as ApplicationGrpcResponse);
  });

  it('should call through to service on generateNumber', async () => {
    const fileNumber = 'file-id';
    mockApplicationService.generateNextFileNumber.mockResolvedValue(fileNumber);
    const res = await controller.generateFileNumber({});

    expect(res).toEqual({ fileNumber });
    expect(mockApplicationService.generateNextFileNumber).toBeCalledTimes(1);
  });
});
