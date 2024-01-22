import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { User } from '../../user/user.entity';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentSubmissionDraftController } from './notice-of-intent-submission-draft.controller';
import { NoticeOfIntentSubmissionDraftService } from './notice-of-intent-submission-draft.service';

describe('NoticeOfIntentSubmissionDraftController', () => {
  let controller: NoticeOfIntentSubmissionDraftController;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoiDraftService: DeepMocked<NoticeOfIntentSubmissionDraftService>;
  let mockUser;

  beforeEach(async () => {
    mockNoiSubmissionService = createMock();
    mockNoiDraftService = createMock();

    mockUser = new User({
      clientRoles: [],
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentSubmissionDraftController],
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: NoticeOfIntentSubmissionDraftService,
          useValue: mockNoiDraftService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentSubmissionDraftController>(
      NoticeOfIntentSubmissionDraftController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for getOrCreateDraft', async () => {
    mockNoiDraftService.getOrCreateDraft.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
    mockNoiDraftService.mapToDetailedDto.mockResolvedValue({} as any);

    const submission = await controller.getOrCreateDraft('fileNumber', {
      user: {
        entity: mockUser,
      },
    });
    expect(submission).toBeDefined();

    expect(mockNoiDraftService.getOrCreateDraft).toHaveBeenCalledTimes(1);
    expect(mockNoiDraftService.mapToDetailedDto).toHaveBeenCalledTimes(1);
  });

  it('should call through for deleteDraft', async () => {
    mockNoiDraftService.deleteDraft.mockResolvedValue();

    await controller.deleteDraft('fileNumber', {
      user: {
        entity: mockUser,
      },
    });
    expect(mockNoiDraftService.deleteDraft).toHaveBeenCalledTimes(1);
  });

  it('should call through for publish', async () => {
    mockNoiDraftService.publish.mockResolvedValue();

    await controller.publishDraft('fileNumber', {
      user: {
        entity: mockUser,
      },
    });
    expect(mockNoiDraftService.publish).toHaveBeenCalledTimes(1);
  });
});
