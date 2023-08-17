import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import {
  initApplicationDecisionMock,
  initApplicationMockEntity,
} from '../../../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../../../test/mocks/mockTypes';
import { ApplicationDecisionProfile } from '../../../../common/automapper/application-decision-v2.automapper.profile';
import { ApplicationProfile } from '../../../../common/automapper/application.automapper.profile';
import { UserProfile } from '../../../../common/automapper/user.automapper.profile';
import { ApplicationService } from '../../../application/application.service';
import { CodeService } from '../../../code/code.service';
import { ApplicationDecisionOutcomeCode } from '../../application-decision-outcome.entity';
import { ApplicationModificationService } from '../../application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../../application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionV2Controller } from './application-decision-v2.controller';
import { ApplicationDecisionV2Service } from './application-decision-v2.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationSubmissionService } from '../../../../portal/application-submission/application-submission.service';
import { EmailService } from '../../../../providers/email/email.service';
import { ApplicationSubmission } from '../../../../portal/application-submission/application-submission.entity';
import { LocalGovernment } from '../../../local-government/local-government.entity';
import { ApplicationOwner } from '../../../../portal/application-submission/application-owner/application-owner.entity';
import { generateALCDHtml } from '../../../../../../../templates/emails/decision-released.template';
import { SUBMISSION_STATUS } from '../../../application/application-submission-status/submission-status.dto';
import { ApplicationDecision } from '../../application-decision.entity';

describe('ApplicationDecisionV2Controller', () => {
  let controller: ApplicationDecisionV2Controller;
  let mockDecisionService: DeepMocked<ApplicationDecisionV2Service>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockModificationService: DeepMocked<ApplicationModificationService>;
  let mockReconService: DeepMocked<ApplicationReconsiderationService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockEmailService: DeepMocked<EmailService>;

  let mockApplication;
  let mockDecision;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockApplicationService = createMock();
    mockCodeService = createMock();
    mockModificationService = createMock();
    mockReconService = createMock();
    mockApplicationSubmissionService = createMock();
    mockEmailService = createMock();

    mockApplication = initApplicationMockEntity();
    mockDecision = initApplicationDecisionMock(mockApplication);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationDecisionV2Controller],
      providers: [
        ApplicationProfile,
        ApplicationDecisionProfile,
        UserProfile,
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: ApplicationModificationService,
          useValue: mockModificationService,
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockReconService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationDecisionV2Controller>(
      ApplicationDecisionV2Controller,
    );

    mockDecisionService.fetchCodes.mockResolvedValue({
      outcomes: [
        {
          code: 'decision-code',
          label: 'decision-label',
        } as ApplicationDecisionOutcomeCode,
      ],
      ceoCriterion: [],
      decisionMakers: [],
      decisionComponentTypes: [],
      decisionConditionTypes: [],
      linkedResolutionOutcomeType: [],
      naruSubtypes: [],
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for application', async () => {
    mockDecisionService.getByAppFileNumber.mockResolvedValue([mockDecision]);

    const result = await controller.getByFileNumber('fake-number');

    expect(mockDecisionService.getByAppFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should get a specific decision', async () => {
    mockDecisionService.get.mockResolvedValue(mockDecision);
    const result = await controller.get('fake-uuid');

    expect(mockDecisionService.get).toBeCalledTimes(1);
    expect(result.uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should call through for deletion', async () => {
    mockDecisionService.delete.mockResolvedValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockDecisionService.delete).toBeCalledTimes(1);
    expect(mockDecisionService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create the decision if application exists', async () => {
    mockApplicationService.getOrFail.mockResolvedValue(mockApplication);
    mockDecisionService.create.mockResolvedValue(mockDecision);

    const decisionToCreate = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      applicationFileNumber: mockApplication.fileNumber,
      outcomeCode: 'outcome',
      isDraft: true,
    } as CreateApplicationDecisionDto;

    await controller.create(decisionToCreate);

    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith(
      {
        applicationFileNumber: mockApplication.fileNumber,
        outcomeCode: 'outcome',
        date: decisionToCreate.date,
        isDraft: true,
      },
      mockApplication,
      undefined,
      undefined,
    );
  });

  it('should update the decision', async () => {
    mockApplicationService.getFileNumber.mockResolvedValue('file-number');
    mockDecisionService.get.mockResolvedValue(new ApplicationDecision());
    mockDecisionService.getByAppFileNumber.mockResolvedValue([
      new ApplicationDecision(),
    ]);
    mockDecisionService.update.mockResolvedValue(mockDecision);

    const updates = {
      outcome: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      isDraft: true,
    } as UpdateApplicationDecisionDto;

    await controller.update('fake-uuid', updates);

    expect(mockDecisionService.update).toBeCalledTimes(1);
    expect(mockDecisionService.update).toBeCalledWith(
      'fake-uuid',
      {
        outcome: 'New Outcome',
        date: updates.date,
        isDraft: true,
      },
      undefined,
      undefined,
    );
  });

  it('should call through for attaching the document', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    await controller.attachDocument('fake-uuid', {
      isMultipart: () => true,
      body: {
        file: {},
      },
      user: {
        entity: {},
      },
    });

    expect(mockDecisionService.attachDocument).toBeCalledTimes(1);
  });

  it('should throw an exception if there is no file for file upload', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    const promise = controller.attachDocument('fake-uuid', {
      file: () => ({}),
      isMultipart: () => false,
      user: {
        entity: {},
      },
    });

    await expect(promise).rejects.toMatchObject(
      new Error('Request is not multipart'),
    );
  });

  it('should call through for getting download url', async () => {
    const fakeUrl = 'fake-url';
    mockDecisionService.getDownloadUrl.mockResolvedValue(fakeUrl);
    const res = await controller.getDownloadUrl('fake-uuid', 'document-uuid');

    expect(mockDecisionService.getDownloadUrl).toBeCalledTimes(1);
    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for getting open url', async () => {
    const fakeUrl = 'fake-url';
    mockDecisionService.getDownloadUrl.mockResolvedValue(fakeUrl);
    const res = await controller.getOpenUrl('fake-uuid', 'document-uuid');

    expect(mockDecisionService.getDownloadUrl).toBeCalledTimes(1);
    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for document deletion', async () => {
    mockDecisionService.deleteDocument.mockResolvedValue({} as any);
    await controller.deleteDocument('fake-uuid', 'document-uuid');

    expect(mockDecisionService.deleteDocument).toBeCalledTimes(1);
  });

  it('should call through for resolution number generation', async () => {
    mockDecisionService.generateResolutionNumber.mockResolvedValue(1);
    await controller.getNextAvailableResolutionNumber(2023);

    expect(mockDecisionService.generateResolutionNumber).toBeCalledTimes(1);
    expect(mockDecisionService.generateResolutionNumber).toBeCalledWith(2023);
  });

  it('should send status email after the first release of any decisions', async () => {
    const fileNumber = 'fake-file-number';
    const primaryContactOwnerUuid = 'primary-contact';
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const localGovernmentUuid = 'fake-government';
    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    const mockApplicationSubmission = new ApplicationSubmission({
      fileNumber,
      primaryContactOwnerUuid,
      owners: [mockOwner],
      localGovernmentUuid,
    });

    mockApplicationService.getFileNumber.mockResolvedValue(fileNumber);
    mockDecisionService.get.mockResolvedValue(
      new ApplicationDecision({ wasReleased: false }),
    );
    mockDecisionService.update.mockResolvedValue(mockDecision);
    mockApplicationSubmissionService.getOrFailByFileNumber.mockResolvedValue(
      mockApplicationSubmission,
    );
    mockEmailService.getSubmissionGovernmentOrFail.mockResolvedValue(
      mockGovernment,
    );
    mockEmailService.sendStatusEmail.mockResolvedValue();

    const updates = {
      outcome: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      isDraft: false,
    } as UpdateApplicationDecisionDto;

    await controller.update('fake-uuid', updates);

    expect(mockDecisionService.update).toBeCalledTimes(1);
    expect(mockDecisionService.update).toBeCalledWith(
      'fake-uuid',
      {
        outcome: 'New Outcome',
        date: updates.date,
        isDraft: false,
      },
      undefined,
      undefined,
    );
    expect(mockEmailService.getSubmissionGovernmentOrFail).toBeCalledTimes(1);
    expect(mockEmailService.getSubmissionGovernmentOrFail).toBeCalledWith(
      mockApplicationSubmission,
    );
    expect(mockEmailService.sendStatusEmail).toBeCalledTimes(1);
    expect(mockEmailService.sendStatusEmail).toBeCalledWith({
      generateStatusHtml: generateALCDHtml,
      status: SUBMISSION_STATUS.ALC_DECISION,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      primaryContact: mockOwner,
      ccGovernment: true,
      decisionReleaseMaskedDate: new Date().toLocaleDateString('en-CA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
  });

  it('should not send status email on subsequent decision releases', async () => {
    mockApplicationService.getFileNumber.mockResolvedValue('fake-file-number');
    mockDecisionService.get.mockResolvedValue(
      new ApplicationDecision({ wasReleased: true }),
    );
    mockDecisionService.update.mockResolvedValue(mockDecision);
    mockEmailService.sendStatusEmail.mockResolvedValue();

    const updates = {
      outcome: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      isDraft: false,
    } as UpdateApplicationDecisionDto;

    await controller.update('fake-uuid', updates);

    expect(mockDecisionService.update).toBeCalledTimes(1);
    expect(mockDecisionService.update).toBeCalledWith(
      'fake-uuid',
      {
        outcome: 'New Outcome',
        date: updates.date,
        isDraft: false,
      },
      undefined,
      undefined,
    );
    expect(mockEmailService.sendStatusEmail).toBeCalledTimes(0);
  });
});
