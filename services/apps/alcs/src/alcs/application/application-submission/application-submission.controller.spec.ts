import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { create } from 'handlebars';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { DocumentService } from '../../../document/document.service';
import { ApplicationOwner } from '../../../portal/application-submission/application-owner/application-owner.entity';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { StatusEmailService } from '../../../providers/email/status-email.service';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { ApplicationSubmissionStatusService } from '../application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../application-submission-status/submission-status.entity';
import { AlcsApplicationSubmissionDto } from '../application.dto';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationSubmissionController } from './application-submission.controller';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionController', () => {
  let controller: ApplicationSubmissionController;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockAppSubStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockAppService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationSubmissionService = createMock();
    mockDocumentService = createMock();
    mockAppSubStatusService = createMock();
    mockStatusEmailService = createMock();
    mockAppService = createMock();

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
          provide: ApplicationSubmissionStatusService,
          useValue: mockAppSubStatusService,
        },
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
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

  it('should update status and clear submitted date when returning to lfng', async () => {
    const fakeFileNumber = 'fake';
    const fakeUuid = 'fake-uuid';
    mockApplicationSubmissionService.update.mockResolvedValue();
    mockApplicationSubmissionService.get.mockResolvedValue(
      new ApplicationSubmission({
        uuid: fakeUuid,
      }),
    );
    mockAppSubStatusService.setStatusDate.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    mockApplicationSubmissionService.mapToDto.mockResolvedValue({} as any);
    const mockDto = {
      returnComment: 'returned comment',
    };
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      submissionGovernment: new LocalGovernment(),
      applicationSubmission: new ApplicationSubmission(),
      primaryContact: new ApplicationOwner(),
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();
    mockAppService.updateByFileNumber.mockResolvedValue(new Application());

    await controller.returnToLfng(fakeFileNumber, mockDto);

    expect(mockApplicationSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationSubmissionService.update).toHaveBeenCalledWith(
      fakeFileNumber,
      mockDto,
    );
    expect(mockApplicationSubmissionService.get).toHaveBeenCalledTimes(2);
    expect(mockAppSubStatusService.setStatusDate).toBeCalledTimes(3);
    expect(mockAppSubStatusService.setStatusDate).toBeCalledWith(
      fakeUuid,
      SUBMISSION_STATUS.RETURNED_TO_LG,
    );
    expect(mockAppSubStatusService.setStatusDate).toBeCalledWith(
      fakeUuid,
      SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      null,
    );
    expect(mockAppSubStatusService.setStatusDate).toBeCalledWith(
      fakeUuid,
      SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
      null,
    );
    expect(mockAppService.updateByFileNumber).toBeCalledWith(fakeFileNumber, {
      dateSubmittedToAlc: null,
    });
    expect(
      mockStatusEmailService.getApplicationEmailData,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
  });
});
