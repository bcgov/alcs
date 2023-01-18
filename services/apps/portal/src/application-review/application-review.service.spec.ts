import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from '../application/application-document/application-document.entity';
import { Application } from '../application/application.entity';
import { ApplicationReviewProfile } from '../common/automapper/application-review.automapper.profile';
import { ApplicationReview } from './application-review.entity';
import { ApplicationReviewService } from './application-review.service';

describe('ApplicationReviewService', () => {
  let service: ApplicationReviewService;
  let mockRepository: DeepMocked<Repository<ApplicationReview>>;

  const mockLocalGovernment = {
    uuid: '',
    name: '',
    isFirstNation: false,
  };

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationReviewProfile,
        {
          provide: getRepositoryToken(ApplicationReview),
          useValue: mockRepository,
        },
        ApplicationReviewService,
      ],
    }).compile();

    service = module.get<ApplicationReviewService>(ApplicationReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call through for get', async () => {
    const appReview = new ApplicationReview();
    mockRepository.findOneOrFail.mockResolvedValue(appReview);

    const res = await service.get('', mockLocalGovernment);

    expect(res).toBe(appReview);
  });

  it('should call save for startReview', async () => {
    const appReview = new ApplicationReview();
    mockRepository.save.mockResolvedValue(appReview);

    const res = await service.startReview(new Application());

    expect(res).toBe(appReview);
  });

  it('should call save for update', async () => {
    const appReview = new ApplicationReview();
    mockRepository.findOneOrFail.mockResolvedValue(appReview);
    mockRepository.save.mockResolvedValue({} as any);

    const res = await service.update('', mockLocalGovernment, {});

    expect(res).toBeDefined();
  });

  it('should call remove for delete', async () => {
    const appReview = new ApplicationReview();
    mockRepository.remove.mockResolvedValue(appReview);

    await service.delete(appReview);

    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception for when verifying an incomplete review', () => {
    const appReview = new ApplicationReview();

    expect(() => {
      service.verifyComplete(new Application(), appReview, false);
    }).toThrow(new BaseServiceException('Contact information not complete'));
  });

  it('should throw an ocp exception for when verifying a review with just contact info', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: null,
    });

    expect(() => {
      service.verifyComplete(new Application(), appReview, false);
    }).toThrow(new BaseServiceException('OCP information not complete'));
  });

  it('should throw a zoning exception for when review has zoning null', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: false,
      isSubjectToZoning: null,
    });

    expect(() => {
      service.verifyComplete(new Application(), appReview, false);
    }).toThrow(new BaseServiceException('Zoning information not complete'));
  });

  it('should throw an authorized exception when review is missing authorized', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: true,
      OCPDesignation: 'designation',
      OCPConsistent: true,
      OCPBylawName: 'bylaw',
      isSubjectToZoning: false,
      isAuthorized: null,
    });

    expect(() => {
      service.verifyComplete(new Application(), appReview, false);
    }).toThrow(
      new BaseServiceException('Review authorization needs to be set'),
    );
  });

  it('should throw an exception when application is missing staff report', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: false,
      isSubjectToZoning: false,
      isAuthorized: true,
    });

    const application = new Application({
      documents: [
        new ApplicationDocument({
          type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      ],
    });

    expect(() => {
      service.verifyComplete(application, appReview, false);
    }).toThrow(
      new BaseServiceException('Review missing staff report document'),
    );
  });

  it('should return the completed review when its valid', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: true,
      OCPDesignation: 'designation',
      OCPConsistent: true,
      OCPBylawName: 'bylaw',
      isSubjectToZoning: false,
      isAuthorized: true,
    });

    const application = new Application({
      documents: [
        new ApplicationDocument({
          type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
        new ApplicationDocument({
          type: 'reviewStaffReport',
        }),
      ],
    });

    const completedReview = service.verifyComplete(
      application,
      appReview,
      false,
    );

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should allow null authorization if both ocp and zoning are false', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isOCPDesignation: false,
      isSubjectToZoning: false,
      isAuthorized: null,
    });

    const application = new Application({
      documents: [
        new ApplicationDocument({
          type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
        new ApplicationDocument({
          type: 'reviewStaffReport',
        }),
      ],
    });

    const completedReview = service.verifyComplete(
      application,
      appReview,
      false,
    );

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should return the completed review when its valid and first nations', () => {
    const appReview = new ApplicationReview({
      localGovernmentFileNumber: '123',
      firstName: 'Bruce',
      lastName: 'Wayne',
      position: 'Not Batman',
      department: 'Gotham',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isAuthorized: true,
    });

    const application = new Application({
      documents: [
        new ApplicationDocument({
          type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
      ],
    });

    const completedReview = service.verifyComplete(
      application,
      appReview,
      true,
    );

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });

  it('should map in the local government first nation flag when mapping dto', async () => {
    const res = await service.mapToDto(new ApplicationReview(), {
      bceidBusinessGuid: '',
      uuid: '',
      name: '',
      isFirstNation: true,
    });

    expect(res.isFirstNationGovernment).toBeTruthy();
  });
});
