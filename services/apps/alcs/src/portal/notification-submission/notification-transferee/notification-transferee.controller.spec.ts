import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NotificationTransfereeProfile } from '../../../common/automapper/notification-transferee.automapper.profile';
import { DocumentService } from '../../../document/document.service';
import { NotificationSubmission } from '../notification-submission.entity';
import { NotificationSubmissionService } from '../notification-submission.service';
import { NotificationTransfereeController } from './notification-transferee.controller';
import { NotificationTransferee } from './notification-transferee.entity';
import { NotificationTransfereeService } from './notification-transferee.service';

describe('NotificationTransfereeController', () => {
  let controller: NotificationTransfereeController;
  let mockNOISubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockOwnerService: DeepMocked<NotificationTransfereeService>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockNOIDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    mockNOISubmissionService = createMock();
    mockOwnerService = createMock();
    mockDocumentService = createMock();
    mockNOIDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NotificationTransfereeController],
      providers: [
        {
          provide: NotificationSubmissionService,
          useValue: mockNOISubmissionService,
        },
        {
          provide: NotificationTransfereeService,
          useValue: mockOwnerService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNOIDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        NotificationTransfereeProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NotificationTransfereeController>(
      NotificationTransfereeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should verify access before fetching applications and map displayName', async () => {
    const transferee = new NotificationTransferee({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission({
        transferees: [transferee],
      }),
    );

    const owners = await controller.fetchByFileId('', {
      user: {
        entity: {},
      },
    });

    expect(owners.length).toEqual(1);
    expect(owners[0].displayName).toBe('Bruce Wayne');
    expect(mockNOISubmissionService.getByUuid).toHaveBeenCalledTimes(1);
  });

  it('should verify the dto and file access then create', async () => {
    const owner = new NotificationTransferee({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission(),
    );
    mockOwnerService.create.mockResolvedValue(owner);

    const createdOwner = await controller.create(
      {
        firstName: 'B',
        lastName: 'W',
        notificationSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: 'INDV',
      },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(createdOwner).toBeDefined();
    expect(mockNOISubmissionService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.create).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when creating an individual owner without first name', async () => {
    const promise = controller.create(
      {
        lastName: 'W',
        notificationSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: 'INDV',
      },
      {
        user: {
          entity: {},
        },
      },
    );
    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Individuals require both first and last name'),
    );
  });

  it('should throw an exception when creating an organization an org name', async () => {
    const promise = controller.create(
      {
        notificationSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: 'ORGZ',
      },
      {
        user: {
          entity: {},
        },
      },
    );
    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Organizations must have an organizationName'),
    );
  });

  it('should call through for update', async () => {
    mockOwnerService.update.mockResolvedValue(new NotificationTransferee());

    const res = await controller.update(
      '',
      {
        organizationName: 'orgName',
        email: '',
        phoneNumber: '',
        typeCode: 'ORGZ',
      },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockOwnerService.update).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    mockOwnerService.delete.mockResolvedValue({} as any);
    mockOwnerService.getOwner.mockResolvedValue(new NotificationTransferee());
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission(),
    );

    await controller.delete('', {
      user: {
        entity: {},
      },
    });

    expect(mockNOISubmissionService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.delete).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.getOwner).toHaveBeenCalledTimes(1);
  });
});
