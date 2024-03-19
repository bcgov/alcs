import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../alcs/application/application.entity';
import { NoticeOfIntent } from '../alcs/notice-of-intent/notice-of-intent.entity';
import { PlanningReview } from '../alcs/planning-review/planning-review.entity';
import { FILE_NUMBER_SEQUENCE } from './file-number.constants';

@Injectable()
export class FileNumberService {
  constructor(
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    @InjectRepository(NoticeOfIntent)
    private noticeOfIntentRepo: Repository<NoticeOfIntent>,
    @InjectRepository(PlanningReview)
    private planningReviewRepo: Repository<PlanningReview>,
  ) {}

  async checkValidFileNumber(fileNumber: string) {
    const applicationExists = await this.applicationRepo.exists({
      where: {
        fileNumber,
      },
    });

    const noticeOfIntentExists = await this.noticeOfIntentRepo.exists({
      where: {
        fileNumber,
      },
    });

    const planningReviewExists = await this.planningReviewRepo.exists({
      where: {
        fileNumber,
      },
    });
    if (applicationExists || planningReviewExists || noticeOfIntentExists) {
      throw new ServiceValidationException(
        `Application/Planning Review/NOI already exists with File ID ${fileNumber}`,
      );
    }
    return true;
  }

  async generateNextFileNumber() {
    const fileNumberArr = await this.applicationRepo.query(
      `select nextval('${FILE_NUMBER_SEQUENCE}') limit 1`,
    );
    return fileNumberArr[0].nextval;
  }
}
