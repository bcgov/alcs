import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerProfile } from '../../../common/automapper/notice-of-intent-owner.automapper.profile';
import {
  OWNER_TYPE,
  OwnerType,
} from '../../../common/owner-type/owner-type.entity';
import { DocumentService } from '../../../document/document.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission.service';
import { NoticeOfIntentOwnerController } from './notice-of-intent-owner.controller';
import { NoticeOfIntentOwner } from './notice-of-intent-owner.entity';
import { NoticeOfIntentOwnerService } from './notice-of-intent-owner.service';

describe('NoticeOfIntentOwnerController', () => {
  let controller: NoticeOfIntentOwnerController;
  let mockNOISubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
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
      controllers: [NoticeOfIntentOwnerController],
      providers: [
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNOISubmissionService,
        },
        {
          provide: NoticeOfIntentOwnerService,
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
        NoticeOfIntentOwnerProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentOwnerController>(
      NoticeOfIntentOwnerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should verify access before fetching applications and map displayName', async () => {
    const owner = new NoticeOfIntentOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission({
        owners: [owner],
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
    const owner = new NoticeOfIntentOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
    mockOwnerService.create.mockResolvedValue(owner);

    const createdOwner = await controller.create(
      {
        firstName: 'B',
        lastName: 'W',
        noticeOfIntentSubmissionUuid: '',
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
        noticeOfIntentSubmissionUuid: '',
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
        noticeOfIntentSubmissionUuid: '',
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
    mockOwnerService.update.mockResolvedValue(new NoticeOfIntentOwner());

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
    mockOwnerService.getOwner.mockResolvedValue(new NoticeOfIntentOwner());
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
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

  it('should call through for attachToParcel', async () => {
    mockOwnerService.attachToParcel.mockResolvedValue({} as any);

    await controller.linkToParcel('', '', {
      user: {
        entity: {},
      },
    });

    expect(mockOwnerService.attachToParcel).toHaveBeenCalledTimes(1);
  });

  it('should call through for removeFromParcel', async () => {
    mockOwnerService.removeFromParcel.mockResolvedValue({} as any);

    await controller.removeFromParcel('', '', {
      user: {
        entity: {},
      },
    });

    expect(mockOwnerService.removeFromParcel).toHaveBeenCalledTimes(1);
  });

  it('should create a new owner when setting primary contact to third party agent that doesnt exist', async () => {
    mockOwnerService.deleteNonParcelOwners.mockResolvedValue([]);
    mockOwnerService.create.mockResolvedValue(new NoticeOfIntentOwner());
    mockOwnerService.setPrimaryContact.mockResolvedValue();
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );

    await controller.setPrimaryContact(
      { noticeOfIntentSubmissionUuid: '' },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockOwnerService.deleteNonParcelOwners).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.create).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.setPrimaryContact).toHaveBeenCalledTimes(1);
    expect(mockNOISubmissionService.getByUuid).toHaveBeenCalledTimes(1);
  });

  it('should set the owner and delete agents when using a non-agent owner', async () => {
    mockOwnerService.getOwner.mockResolvedValue(
      new NoticeOfIntentOwner({
        type: new OwnerType({
          code: OWNER_TYPE.INDIVIDUAL,
        }),
      }),
    );
    mockOwnerService.setPrimaryContact.mockResolvedValue();
    mockOwnerService.deleteNonParcelOwners.mockResolvedValue({} as any);
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );

    await controller.setPrimaryContact(
      { noticeOfIntentSubmissionUuid: '', ownerUuid: 'fake-uuid' },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockOwnerService.setPrimaryContact).toHaveBeenCalledTimes(1);
    expect(mockNOISubmissionService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.deleteNonParcelOwners).toHaveBeenCalledTimes(1);
  });

  it('should update the agent owner when calling set primary contact', async () => {
    mockOwnerService.getOwner.mockResolvedValue(
      new NoticeOfIntentOwner({
        type: new OwnerType({
          code: OWNER_TYPE.AGENT,
        }),
      }),
    );
    mockOwnerService.update.mockResolvedValue(new NoticeOfIntentOwner());
    mockOwnerService.setPrimaryContact.mockResolvedValue();
    mockNOISubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );

    await controller.setPrimaryContact(
      { noticeOfIntentSubmissionUuid: '', ownerUuid: 'fake-uuid' },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockOwnerService.setPrimaryContact).toHaveBeenCalledTimes(1);
    expect(mockNOISubmissionService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockOwnerService.update).toHaveBeenCalledTimes(1);
  });
});
