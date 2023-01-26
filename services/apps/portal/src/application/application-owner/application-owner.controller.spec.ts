import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationOwnerProfile } from '../../common/automapper/application-owner.automapper.profile';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationOwnerController } from './application-owner.controller';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

describe('ApplicationOwnerController', () => {
  let controller: ApplicationOwnerController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockAppOwnerService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationOwnerController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
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
    mockApplicationService.verifyAccess.mockResolvedValue(new Application());
    mockAppOwnerService.fetchByApplicationFileId.mockResolvedValue([owner]);

    const owners = await controller.fetchByFileId('', {
      user: {
        entity: {},
      },
    });

    expect(owners.length).toEqual(1);
    expect(owners[0].displayName).toBe('Bruce Wayne');
    expect(mockApplicationService.verifyAccess).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.fetchByApplicationFileId).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should verify the dto and file access then create', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockApplicationService.verifyAccess.mockResolvedValue(new Application());
    mockAppOwnerService.create.mockResolvedValue(owner);

    const createdOwner = await controller.create(
      {
        firstName: 'B',
        lastName: 'W',
        applicationFileId: '',
        email: '',
        parcelUuid: '',
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
    expect(mockApplicationService.verifyAccess).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.create).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when creating an individual owner without first name', async () => {
    const promise = controller.create(
      {
        lastName: 'W',
        applicationFileId: '',
        email: '',
        parcelUuid: '',
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
        applicationFileId: '',
        email: '',
        parcelUuid: '',
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
    mockAppOwnerService.verifyAccess.mockResolvedValue();

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
    expect(mockAppOwnerService.verifyAccess).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    mockAppOwnerService.delete.mockResolvedValue({} as any);
    mockAppOwnerService.verifyAccess.mockResolvedValue();

    await controller.delete('', {
      user: {
        entity: {},
      },
    });

    expect(mockAppOwnerService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.verifyAccess).toHaveBeenCalledTimes(1);
  });

  it('should call through for attachToParcel', async () => {
    mockAppOwnerService.attachToParcel.mockResolvedValue({} as any);
    mockAppOwnerService.verifyAccess.mockResolvedValue();

    await controller.linkToParcel('', '', {
      user: {
        entity: {},
      },
    });

    expect(mockAppOwnerService.attachToParcel).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.verifyAccess).toHaveBeenCalledTimes(1);
  });

  it('should call through for removeFromParcel', async () => {
    mockAppOwnerService.removeFromParcel.mockResolvedValue({} as any);
    mockAppOwnerService.verifyAccess.mockResolvedValue();

    await controller.removeFromParcel('', '', {
      user: {
        entity: {},
      },
    });

    expect(mockAppOwnerService.removeFromParcel).toHaveBeenCalledTimes(1);
    expect(mockAppOwnerService.verifyAccess).toHaveBeenCalledTimes(1);
  });
});
