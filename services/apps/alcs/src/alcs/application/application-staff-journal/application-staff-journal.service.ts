import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { User } from '../../../user/user.entity';
import { ApplicationService } from '../application.service';
import { ApplicationStaffJournal } from './application-staff-journal.entity';

@Injectable()
export class ApplicationStaffJournalService {
  private DEFAULT_APPLICATION_STAFF_JOURNAL_RELATIONS: FindOptionsRelations<ApplicationStaffJournal> =
    {
      author: true,
    };

  constructor(
    @InjectRepository(ApplicationStaffJournal)
    private applicationStaffJournalRepository: Repository<ApplicationStaffJournal>, // private cardService: CardService, // private commentMentionService: CommentMentionService, // private notificationService: NotificationService,
    private applicationService: ApplicationService,
  ) {}

  async fetch(applicationUuid: string) {
    return this.applicationStaffJournalRepository.find({
      where: {
        applicationUuid,
      },
      relations: this.DEFAULT_APPLICATION_STAFF_JOURNAL_RELATIONS,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async get(commentUuid: string) {
    return this.applicationStaffJournalRepository.findOne({
      where: {
        uuid: commentUuid,
      },
      relations: this.DEFAULT_APPLICATION_STAFF_JOURNAL_RELATIONS,
    });
  }

  async create(fileNumber: string, commentBody: string, author: User) {
    const application = await this.applicationService.getOrFail(fileNumber);

    const record = new ApplicationStaffJournal({
      body: commentBody,
      application,
      author,
    });

    const createRecord = await this.applicationStaffJournalRepository.save(
      record,
    );

    return createRecord;
  }

  async delete(uuid: string): Promise<void> {
    const comment = await this.applicationStaffJournalRepository.findOne({
      where: { uuid },
    });

    if (!comment) {
      throw new ServiceNotFoundException(
        `Failed to find comment with uuid ${uuid}`,
      );
    }

    await this.applicationStaffJournalRepository.softRemove([comment]);
    return;
  }

  async update(uuid: string, body: string) {
    const comment = await this.applicationStaffJournalRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_APPLICATION_STAFF_JOURNAL_RELATIONS,
      },
    });

    if (!comment) {
      throw new ServiceNotFoundException(
        `Failed to find comment with uuid ${uuid}`,
      );
    }

    if (body.trim() === '') {
      throw new ServiceValidationException('Comment body must be filled.');
    }

    comment.edited = true;
    comment.body = body;

    const card = await this.applicationService.get(comment.applicationUuid);
    if (!card) {
      throw new ServiceNotFoundException(
        `Failed to find card with uuid ${comment.applicationUuid}`,
      );
    }

    await this.applicationStaffJournalRepository.save(comment);

    return;
  }
}
