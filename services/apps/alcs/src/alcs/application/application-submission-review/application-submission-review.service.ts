import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationSubmissionReviewDto } from '../../../portal/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReview } from '../../../portal/application-submission-review/application-submission-review.entity';

@Injectable()
export class ApplicationSubmissionReviewService {
  constructor(
    @InjectRepository(ApplicationSubmissionReview)
    private applicationSubmissionReviewRepository: Repository<ApplicationSubmissionReview>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async get(fileNumber: string) {
    return await this.applicationSubmissionReviewRepository.findOneOrFail({
      where: { applicationFileNumber: fileNumber },
    });
  }

  async mapToDto(submission: ApplicationSubmissionReview) {
    return this.mapper.mapAsync(
      submission,
      ApplicationSubmissionReview,
      ApplicationSubmissionReviewDto,
    );
  }
}
