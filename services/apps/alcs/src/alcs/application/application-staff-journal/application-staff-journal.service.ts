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
    private applicationStaffJournalRepository: Repository<ApplicationStaffJournal>, // private cardService: CardService, // private noteMentionService: noteMentionService, // private notificationService: NotificationService,
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

  async get(noteUuid: string) {
    return this.applicationStaffJournalRepository.findOne({
      where: {
        uuid: noteUuid,
      },
      relations: this.DEFAULT_APPLICATION_STAFF_JOURNAL_RELATIONS,
    });
  }

  async create(fileNumber: string, noteBody: string, author: User) {
    const application = await this.applicationService.getOrFail(fileNumber);

    const record = new ApplicationStaffJournal({
      body: noteBody,
      application,
      author,
    });

    const createRecord = await this.applicationStaffJournalRepository.save(
      record,
    );

    return createRecord;
  }

  async delete(uuid: string): Promise<void> {
    const note = await this.applicationStaffJournalRepository.findOne({
      where: { uuid },
    });

    if (!note) {
      throw new ServiceNotFoundException(
        `Failed to find note with uuid ${uuid}`,
      );
    }

    await this.applicationStaffJournalRepository.softRemove([note]);
    return;
  }

  async update(uuid: string, body: string) {
    const note = await this.applicationStaffJournalRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_APPLICATION_STAFF_JOURNAL_RELATIONS,
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

    const card = await this.applicationService.get(note.applicationUuid);
    if (!card) {
      throw new ServiceNotFoundException(
        `Failed to find application with uuid ${note.applicationUuid}`,
      );
    }

    await this.applicationStaffJournalRepository.save(note);

    return;
  }
}
