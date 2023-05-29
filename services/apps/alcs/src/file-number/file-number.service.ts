import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../alcs/application/application.entity';
import { Covenant } from '../alcs/covenant/covenant.entity';
import { NoticeOfIntent } from '../alcs/notice-of-intent/notice-of-intent.entity';

@Injectable()
export class FileNumberService {
  constructor(
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    @InjectRepository(Covenant)
    private covenantRepo: Repository<Covenant>,
    @InjectRepository(NoticeOfIntent)
    private noticeOfIntentRepo: Repository<NoticeOfIntent>,
  ) {}

  async checkValidFileNumber(fileNumber: string) {
    const applicationExists = await this.applicationRepo.exist({
      where: {
        fileNumber,
      },
    });

    const covenantExists = await this.covenantRepo.exist({
      where: {
        fileNumber,
      },
    });

    const noticeOfIntentExists = await this.noticeOfIntentRepo.exist({
      where: {
        fileNumber,
      },
    });
    if (applicationExists || covenantExists || noticeOfIntentExists) {
      throw new ServiceValidationException(
        `Application/Covenant/NOI already exists with File ID ${fileNumber}`,
      );
    }
    return true;
  }
}
