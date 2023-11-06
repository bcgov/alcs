import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { Document } from '../../../document/document.entity';
import { DocumentService } from '../../../document/document.service';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { AlcsApplicationSubmissionDto } from '../application.dto';
import { ApplicationSubmissionController } from './application-submission.controller';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionController', () => {
  let controller: ApplicationSubmissionController;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockApplicationSubmissionService = createMock();
    mockDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationSubmissionController],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationSubmissionController>(
      ApplicationSubmissionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call applicationSubmissionService to get Application Submission', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionService.get.mockResolvedValue({
      fileNumber: fakeFileNumber,
    } as ApplicationSubmission);
    mockApplicationSubmissionService.mapToDto.mockResolvedValue(
      createMock<AlcsApplicationSubmissionDto>(),
    );

    const result = await controller.get(fakeFileNumber);

    expect(mockApplicationSubmissionService.get).toBeCalledTimes(1);
    expect(mockApplicationSubmissionService.mapToDto).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should call through to service for fetching transferees', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionService.getTransferees.mockResolvedValue([]);

    const result = await controller.getCovenantTransferees(fakeFileNumber);

    expect(mockApplicationSubmissionService.getTransferees).toBeCalledTimes(1);
    expect(mockApplicationSubmissionService.getTransferees).toBeCalledWith(
      fakeFileNumber,
    );
    expect(result).toEqual([]);
  });
});
