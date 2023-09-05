import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NotificationSubmissionProfile } from '../../common/automapper/notification-submission.automapper.profile';
import { EmailService } from '../../providers/email/email.service';
import { User } from '../../user/user.entity';
import { NotificationSubmissionController } from './notification-submission.controller';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
} from './notification-submission.dto';
import { NotificationSubmission } from './notification-submission.entity';
import { NotificationSubmissionService } from './notification-submission.service';
import { NotificationTransferee } from './notification-transferee/notification-transferee.entity';

describe('NotificationSubmissionController', () => {
  let controller: NotificationSubmissionController;
  let mockNoiSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockEmailService: DeepMocked<EmailService>;

  const primaryContactOwnerUuid = 'primary-contact';
  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockNoiSubmissionService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();
    mockEmailService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSubmissionController],
      providers: [
        NotificationSubmissionProfile,
        {
          provide: NotificationSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLgService,
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
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();

    controller = module.get<NotificationSubmissionController>(
      NotificationSubmissionController,
    );

    mockNoiSubmissionService.update.mockResolvedValue(
      new NotificationSubmission({
        applicant: applicant,
        localGovernmentUuid,
      }),
    );

    mockNoiSubmissionService.create.mockResolvedValue('2');
    mockNoiSubmissionService.getByFileNumber.mockResolvedValue(
      new NotificationSubmission(),
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission(),
    );

    mockNoiSubmissionService.mapToDTOs.mockResolvedValue([]);
    mockLgService.list.mockResolvedValue([
      new LocalGovernment({
        uuid: localGovernmentUuid,
        bceidBusinessGuid,
        name: 'fake-name',
        isFirstNation: false,
      }),
    ]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching notice of intents', async () => {
    mockNoiSubmissionService.getAllByUser.mockResolvedValue([]);

    const submissions = await controller.getSubmissions({
      user: {
        entity: new User(),
      },
    });

    expect(submissions).toBeDefined();
    expect(mockNoiSubmissionService.getAllByUser).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when fetching a notice of intent', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );

    const noticeOfIntent = controller.getSubmission(
      {
        user: {
          entity: new User(),
        },
      },
      '',
    );

    expect(noticeOfIntent).toBeDefined();
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(1);
  });

  it('should fetch notice of intent by bceid if user has same guid as a local government', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission({
        localGovernmentUuid: '',
      }),
    );

    const noiSubmission = controller.getSubmission(
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'guid',
          }),
        },
      },
      '',
    );

    expect(noiSubmission).toBeDefined();
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating an notice of intent', async () => {
    mockNoiSubmissionService.create.mockResolvedValue('');
    mockNoiSubmissionService.mapToDTOs.mockResolvedValue([
      {} as NotificationSubmissionDto,
    ]);

    const noiSubmission = await controller.create({
      user: {
        entity: new User(),
      },
    });

    expect(noiSubmission).toBeDefined();
    expect(mockNoiSubmissionService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission({}),
    );

    await controller.update(
      'file-id',
      {
        localGovernmentUuid,
        applicant,
      },
      {
        user: {
          entity: new User({
            clientRoles: [],
          }),
        },
      },
    );

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });

  // it('should throw an exception when trying to update a not in progress noi', async () => {
  //   mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
  //     {} as NotificationSubmissionDetailedDto,
  //   );
  //
  //   const promise = controller.update(
  //     'file-id',
  //     {
  //       localGovernmentUuid,
  //       applicant,
  //     },
  //     {
  //       user: {
  //         entity: new User({
  //           clientRoles: [],
  //         }),
  //       },
  //     },
  //   );
  //   await expect(promise).rejects.toMatchObject(
  //     new BadRequestException('Can only edit in progress Notice of Intents'),
  //   );
  //
  //   expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(0);
  //   expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(0);
  // });

  it('should call out to service on submitAlcs', async () => {
    const mockFileId = 'file-id';
    const mockOwner = new NotificationTransferee({
      uuid: primaryContactOwnerUuid,
    });
    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    const mockSubmission = new NotificationSubmission({
      fileNumber: mockFileId,
      transferees: [mockOwner],
      localGovernmentUuid,
    });

    mockNoiSubmissionService.submitToAlcs.mockResolvedValue(
      new NoticeOfIntent(),
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(mockSubmission);
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(2);
    expect(mockNoiSubmissionService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });
});
