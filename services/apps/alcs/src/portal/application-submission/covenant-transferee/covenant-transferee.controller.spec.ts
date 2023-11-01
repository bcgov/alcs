import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationSubmissionProfile } from '../../../common/automapper/application-submission.automapper.profile';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import { CovenantTransfereeController } from './covenant-transferee.controller';
import { CovenantTransferee } from './covenant-transferee.entity';
import { CovenantTransfereeService } from './covenant-transferee.service';

describe('CovenantTransfereeController', () => {
  let controller: CovenantTransfereeController;
  let mockAppSubService: DeepMocked<ApplicationSubmissionService>;
  let mockCovTransfereeService: DeepMocked<CovenantTransfereeService>;

  beforeEach(async () => {
    mockAppSubService = createMock();
    mockCovTransfereeService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [CovenantTransfereeController],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubService,
        },
        {
          provide: CovenantTransfereeService,
          useValue: mockCovTransfereeService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ApplicationSubmissionProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<CovenantTransfereeController>(
      CovenantTransfereeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should verify access before fetching transferees and map displayName', async () => {
    const transferee = new CovenantTransferee({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockAppSubService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission({}),
    );

    mockCovTransfereeService.fetchBySubmissionUuid.mockResolvedValue([
      transferee,
    ]);

    const owners = await controller.fetchByFileId('', {
      user: {
        entity: {},
      },
    });

    expect(owners.length).toEqual(1);
    expect(owners[0].displayName).toBe('Bruce Wayne');
    expect(mockAppSubService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
  });

  it('should verify the dto and file access then create', async () => {
    const owner = new CovenantTransferee({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockAppSubService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockCovTransfereeService.create.mockResolvedValue(owner);

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
    expect(mockAppSubService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockCovTransfereeService.create).toHaveBeenCalledTimes(1);
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
    mockCovTransfereeService.update.mockResolvedValue(new CovenantTransferee());

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

    expect(mockCovTransfereeService.update).toHaveBeenCalledTimes(1);
  });

  it('should call through for delete', async () => {
    mockCovTransfereeService.delete.mockResolvedValue({} as any);
    mockCovTransfereeService.getOwner.mockResolvedValue(
      new CovenantTransferee(),
    );
    mockAppSubService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.delete('', {
      user: {
        entity: {},
      },
    });

    expect(mockAppSubService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockCovTransfereeService.delete).toHaveBeenCalledTimes(1);
    expect(mockCovTransfereeService.getOwner).toHaveBeenCalledTimes(1);
  });
});
