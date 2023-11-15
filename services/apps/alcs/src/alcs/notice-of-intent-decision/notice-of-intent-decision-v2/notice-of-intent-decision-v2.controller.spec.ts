import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDecisionProfile } from '../../../common/automapper/notice-of-intent-decision.automapper.profile';
import { NoticeOfIntentProfile } from '../../../common/automapper/notice-of-intent.automapper.profile';
import { UserProfile } from '../../../common/automapper/user.automapper.profile';
import { NoticeOfIntentSubmissionService } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.service';
import { EmailService } from '../../../providers/email/email.service';
import { CodeService } from '../../code/code.service';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionOutcome } from '../notice-of-intent-decision-outcome.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionDto,
} from '../notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentModificationService } from '../notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionV2Controller } from './notice-of-intent-decision-v2.controller';
import { NoticeOfIntentDecisionV2Service } from './notice-of-intent-decision-v2.service';

describe('NoticeOfIntentDecisionV2Controller', () => {
  let controller: NoticeOfIntentDecisionV2Controller;
  let mockDecisionService: DeepMocked<NoticeOfIntentDecisionV2Service>;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockNoticeOfIntentSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockEmailService: DeepMocked<EmailService>;

  let mockNoticeOfintent;
  let mockDecision;

  beforeEach(async () => {
    mockDecisionService = createMock();
    mockNoticeOfIntentService = createMock();
    mockCodeService = createMock();
    mockModificationService = createMock();
    mockNoticeOfIntentSubmissionService = createMock();
    mockEmailService = createMock();

    mockNoticeOfintent = new NoticeOfIntent();
    mockDecision = new NoticeOfIntentDecision({
      noticeOfIntent: mockNoticeOfintent,
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentDecisionV2Controller],
      providers: [
        NoticeOfIntentProfile,
        NoticeOfIntentDecisionProfile,
        UserProfile,
        {
          provide: NoticeOfIntentDecisionV2Service,
          useValue: mockDecisionService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoticeOfIntentService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockModificationService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoticeOfIntentSubmissionService,
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

    controller = module.get<NoticeOfIntentDecisionV2Controller>(
      NoticeOfIntentDecisionV2Controller,
    );

    mockDecisionService.fetchCodes.mockResolvedValue({
      outcomes: [
        {
          code: 'decision-code',
          label: 'decision-label',
        } as NoticeOfIntentDecisionOutcome,
      ],
      decisionComponentTypes: [],
      decisionConditionTypes: [],
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for notice of intent', async () => {
    mockDecisionService.getByFileNumber.mockResolvedValue([mockDecision]);

    const result = await controller.getByFileNumber('fake-number');

    expect(mockDecisionService.getByFileNumber).toBeCalledTimes(1);
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

  it('should create the decision if noi exists', async () => {
    mockNoticeOfIntentService.getByFileNumber.mockResolvedValue(
      mockNoticeOfintent,
    );
    mockDecisionService.create.mockResolvedValue(mockDecision);

    const decisionToCreate: CreateNoticeOfIntentDecisionDto = {
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      fileNumber: mockNoticeOfintent.fileNumber,
      outcomeCode: 'outcome',
      isDraft: true,
    };

    await controller.create(decisionToCreate);

    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith(
      {
        fileNumber: mockNoticeOfintent.fileNumber,
        outcomeCode: 'outcome',
        date: decisionToCreate.date,
        isDraft: true,
      },
      mockNoticeOfintent,
      undefined,
    );
  });

  it('should update the decision', async () => {
    mockNoticeOfIntentService.getFileNumber.mockResolvedValue('file-number');
    mockDecisionService.get.mockResolvedValue(new NoticeOfIntentDecision());
    mockDecisionService.getByFileNumber.mockResolvedValue([
      new NoticeOfIntentDecision(),
    ]);
    mockDecisionService.update.mockResolvedValue(mockDecision);

    const updates = {
      outcome: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      isDraft: true,
    } as UpdateNoticeOfIntentDecisionDto;

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

  it('should call through for updating the file', async () => {
    mockDecisionService.updateDocument.mockResolvedValue({} as any);
    await controller.updateDocument('fake-uuid', 'document-uuid', {
      fileName: '',
    });

    expect(mockDecisionService.updateDocument).toBeCalledTimes(1);
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
});
