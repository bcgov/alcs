import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { StaffJournal } from './staff-journal.entity';

@Injectable()
export class StaffJournalService {
  private DEFAULT_STAFF_JOURNAL_RELATIONS: FindOptionsRelations<StaffJournal> =
    {
      author: true,
    };

  constructor(
    @InjectRepository(StaffJournal)
    private staffJournalRepository: Repository<StaffJournal>,
  ) {}

  async fetch(parentUuid: string) {
    return this.staffJournalRepository.find({
      where: [
        {
          applicationUuid: parentUuid,
        },
        {
          noticeOfIntentUuid: parentUuid,
        },
        {
          notificationUuid: parentUuid,
        },
        {
          planningReviewUuid: parentUuid,
        },
        {
          inquiryUuid: parentUuid,
        },
      ],
      relations: this.DEFAULT_STAFF_JOURNAL_RELATIONS,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async get(noteUuid: string) {
    return this.staffJournalRepository.findOne({
      where: {
        uuid: noteUuid,
      },
      relations: this.DEFAULT_STAFF_JOURNAL_RELATIONS,
    });
  }

  async createForApplication(
    applicationUuid: string,
    noteBody: string,
    author: User,
  ) {
    const record = new StaffJournal({
      body: noteBody,
      applicationUuid,
      author,
    });

    return await this.staffJournalRepository.save(record);
  }

  async createForNoticeOfIntent(
    noticeOfIntentUuid: string,
    noteBody: string,
    author: User,
  ) {
    const record = new StaffJournal({
      body: noteBody,
      noticeOfIntentUuid,
      author,
    });

    return await this.staffJournalRepository.save(record);
  }

  async createForNotification(
    notificationUuid: string,
    noteBody: string,
    author: User,
  ) {
    const record = new StaffJournal({
      body: noteBody,
      notificationUuid,
      author,
    });

    return await this.staffJournalRepository.save(record);
  }

  async createForPlanningReview(
    planningReviewUuid: string,
    noteBody: string,
    author: User,
  ) {
    const record = new StaffJournal({
      body: noteBody,
      planningReviewUuid,
      author,
    });

    return await this.staffJournalRepository.save(record);
  }

  async createForInquiry(inquiryUuid: string, noteBody: string, author: User) {
    const record = new StaffJournal({
      body: noteBody,
      inquiryUuid,
      author,
    });

    return await this.staffJournalRepository.save(record);
  }

  async delete(uuid: string): Promise<void> {
    const note = await this.staffJournalRepository.findOne({
      where: { uuid },
    });

    if (!note) {
      throw new ServiceNotFoundException(
        `Failed to find note with uuid ${uuid}`,
      );
    }

    await this.staffJournalRepository.softRemove([note]);
    return;
  }

  async update(uuid: string, body: string) {
    const note = await this.staffJournalRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_STAFF_JOURNAL_RELATIONS,
      },
    });

    if (!note) {
      throw new ServiceNotFoundException(
        `Failed to find note with uuid ${uuid}`,
      );
    }

    if (body.trim() === '') {
      throw new ServiceValidationException('note body must be filled.');
    }

    note.edited = true;
    note.body = body;

    await this.staffJournalRepository.save(note);

    return;
  }
}
