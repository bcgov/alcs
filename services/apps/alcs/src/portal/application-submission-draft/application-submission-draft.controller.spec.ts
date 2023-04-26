import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { User } from '../../user/user.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationSubmissionDraftController } from './application-submission-draft.controller';
import { ApplicationSubmissionDraftService } from './application-submission-draft.service';

describe('ApplicationSubmissionDraftController', () => {
  let controller: ApplicationSubmissionDraftController;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockAppEditService: DeepMocked<ApplicationSubmissionDraftService>;

  beforeEach(async () => {
    mockAppSubmissionService = createMock();
    mockAppEditService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionDraftController],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ApplicationSubmissionDraftService,
          useValue: mockAppEditService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationSubmissionDraftController>(
      ApplicationSubmissionDraftController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for getOrCreateDraft', async () => {
    mockAppEditService.getOrCreateDraft.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppEditService.mapToDetailedDto.mockResolvedValue({} as any);

    const submission = await controller.getOrCreateDraft('fileNumber');
    expect(submission).toBeDefined();

    expect(mockAppEditService.getOrCreateDraft).toHaveBeenCalledTimes(1);
    expect(mockAppEditService.mapToDetailedDto).toHaveBeenCalledTimes(1);
  });

  it('should call through for deleteDraft', async () => {
    mockAppEditService.deleteDraft.mockResolvedValue();

    await controller.deleteDraft('fileNumber');
    expect(mockAppEditService.deleteDraft).toHaveBeenCalledTimes(1);
  });

  it('should call through for publish', async () => {
    mockAppEditService.publish.mockResolvedValue();

    await controller.publishDraft('fileNumber', {
      user: {
        entity: new User(),
      },
    });
    expect(mockAppEditService.publish).toHaveBeenCalledTimes(1);
  });
});
