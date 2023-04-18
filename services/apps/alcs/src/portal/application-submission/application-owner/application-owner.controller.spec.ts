import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { ApplicationOwnerProfile } from '../../../common/automapper/application-owner.automapper.profile';
import { DocumentService } from '../../../document/document.service';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import { ApplicationOwnerType } from './application-owner-type/application-owner-type.entity';
import { ApplicationOwnerController } from './application-owner.controller';
import { APPLICATION_OWNER } from './application-owner.dto';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

describe('ApplicationOwnerController', () => {
  let controller: ApplicationOwnerController;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockApplicationSubmissionService = createMock();
    mockAppOwnerService = createMock();
    mockDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationOwnerController],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ApplicationOwnerProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationOwnerController>(
      ApplicationOwnerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should verify access before fetching applications and map displayName', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission({
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
    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
  });

  it('should verify the dto and file access then create', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppOwnerService.create.mockResolvedValue(owner);

    const createdOwner = await controller.create(
      {
        firstName: 'B',
        lastName: 'W',
        applicationSubmissionUuid: '',
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
    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.create).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when creating an individual owner without first name', async () => {
    const promise = controller.create(
      {
        lastName: 'W',
        applicationSubmissionUuid: '',
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
        applicationSubmissionUuid: '',
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
    mockAppOwnerService.update.mockResolvedValue(new ApplicationOwner());
    mockAppOwnerService.getOwner.mockResolvedValue(new ApplicationOwner());
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

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

    expect(mockAppOwnerService.update).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.getOwner).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    mockAppOwnerService.delete.mockResolvedValue({} as any);
    mockAppOwnerService.getOwner.mockResolvedValue(new ApplicationOwner());
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.delete('', {
      user: {
        entity: {},
      },
    });

    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.getOwner).toHaveBeenCalledTimes(1);
  });

  it('should call through for attachToParcel', async () => {
    mockAppOwnerService.attachToParcel.mockResolvedValue({} as any);
    mockAppOwnerService.getOwner.mockResolvedValue(new ApplicationOwner());
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.linkToParcel('', '', {
      user: {
        entity: {},
      },
    });

    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.attachToParcel).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.getOwner).toHaveBeenCalledTimes(1);
  });

  it('should call through for removeFromParcel', async () => {
    mockAppOwnerService.removeFromParcel.mockResolvedValue({} as any);
    mockAppOwnerService.getOwner.mockResolvedValue(new ApplicationOwner());
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.removeFromParcel('', '', {
      user: {
        entity: {},
      },
    });

    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.removeFromParcel).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.getOwner).toHaveBeenCalledTimes(1);
  });

  it('should create a new owner when setting primary contact to third party agent that doesnt exist', async () => {
    mockAppOwnerService.create.mockResolvedValue(new ApplicationOwner());
    mockAppOwnerService.setPrimaryContact.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.setPrimaryContact(
      { applicationSubmissionUuid: '' },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockAppOwnerService.create).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.setPrimaryContact).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
  });

  it('should set the owner and delete agents when using a non-agent owner', async () => {
    mockAppOwnerService.getOwner.mockResolvedValue(
      new ApplicationOwner({
        type: new ApplicationOwnerType({
          code: APPLICATION_OWNER.INDIVIDUAL,
        }),
      }),
    );
    mockAppOwnerService.setPrimaryContact.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppOwnerService.deleteAgents.mockResolvedValue({} as any);
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.setPrimaryContact(
      { applicationSubmissionUuid: '', ownerUuid: 'fake-uuid' },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockAppOwnerService.setPrimaryContact).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.deleteAgents).toHaveBeenCalledTimes(1);
  });

  it('should update the agent owner when calling set primary contact', async () => {
    mockAppOwnerService.getOwner.mockResolvedValue(
      new ApplicationOwner({
        type: new ApplicationOwnerType({
          code: APPLICATION_OWNER.AGENT,
        }),
      }),
    );
    mockAppOwnerService.update.mockResolvedValue(new ApplicationOwner());
    mockAppOwnerService.setPrimaryContact.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockApplicationSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.setPrimaryContact(
      { applicationSubmissionUuid: '', ownerUuid: 'fake-uuid' },
      {
        user: {
          entity: {},
        },
      },
    );

    expect(mockAppOwnerService.setPrimaryContact).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionService.verifyAccessByUuid,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.update).toHaveBeenCalledTimes(1);
  });
});
