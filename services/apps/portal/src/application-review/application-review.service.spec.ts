import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
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
      providers: [
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

  it('should throw an exception for when verifying an incomplete review', () => {
    const appReview = new ApplicationReview();

    expect(() => {
      service.verifyComplete(appReview);
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
      service.verifyComplete(appReview);
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
      service.verifyComplete(appReview);
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
      isOCPDesignation: false,
      isSubjectToZoning: false,
      isAuthorized: null,
    });

    expect(() => {
      service.verifyComplete(appReview);
    }).toThrow(
      new BaseServiceException('Review authorization needs to be set'),
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
      isOCPDesignation: false,
      isSubjectToZoning: false,
      isAuthorized: true,
    });

    const completedReview = service.verifyComplete(appReview);

    expect(completedReview).toBeDefined();
    expect(completedReview).toMatchObject(appReview);
  });
});
