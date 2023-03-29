import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { User } from '../../../user/user.entity';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationStaffJournal } from './application-staff-journal.entity';
import { ApplicationStaffJournalService } from './application-staff-journal.service';

describe('ApplicationStaffJournalService', () => {
  let service: ApplicationStaffJournalService;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationStaffJournalRepository: DeepMocked<
    Repository<ApplicationStaffJournal>
  >;

  let note;
  let user;
  let application;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationStaffJournalRepository = createMock();

    user = {
      name: 'Bruce Wayne',
      email: 'fake-email',
      uuid: 'user-uuid',
    } as User;

    application = new Application({ uuid: 'fake_application_uuid' });

    note = new ApplicationStaffJournal({
      body: 'fake',
      uuid: 'note-uuid',
      application,
      author: user as User,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationStaffJournalService,
        {
          provide: getRepositoryToken(ApplicationStaffJournal),
          useValue: mockApplicationStaffJournalRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    service = module.get<ApplicationStaffJournalService>(
      ApplicationStaffJournalService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched notes', async () => {
    mockApplicationStaffJournalRepository.find.mockResolvedValue([note]);

    const notes = await service.fetch('fake_application_uuid');

    expect(mockApplicationStaffJournalRepository.find).toHaveBeenCalledTimes(1);
    expect(notes.length).toEqual(1);
    expect(notes[0]).toEqual(note);
  });

  it('should return the fetched note', async () => {
    mockApplicationStaffJournalRepository.findOne.mockResolvedValue(note);

    const loadedNote = await service.get('note-uuid');

    expect(mockApplicationStaffJournalRepository.findOne).toHaveBeenCalledTimes(
      1,
    );
    expect(loadedNote).toEqual(note);
  });

  it('should save the new note with the user', async () => {
    const fakeNote = {
      uuid: 'fake',
      application,
      applicationUuid: application.uuid,
    } as ApplicationStaffJournal;

    mockApplicationService.getByUuidOrFail.mockResolvedValue(application);
    mockApplicationStaffJournalRepository.save.mockResolvedValue(
      {} as ApplicationStaffJournal,
    );

    await service.create(application.uuid, 'new-note', user);

    expect(mockApplicationStaffJournalRepository.save).toHaveBeenCalledTimes(1);
    const savedData =
      mockApplicationStaffJournalRepository.save.mock.calls[0][0];
    expect(savedData.author).toEqual(user);
    expect(savedData.application).toEqual(fakeNote.application);
    expect(savedData.body).toEqual('new-note');
  });

  it('should call soft remove when deleting', async () => {
    mockApplicationStaffJournalRepository.findOne.mockResolvedValue(note);
    mockApplicationStaffJournalRepository.softRemove.mockResolvedValue(
      {} as ApplicationStaffJournal,
    );

    await service.delete(note.uuid);

    expect(mockApplicationStaffJournalRepository.findOne).toHaveBeenCalledTimes(
      1,
    );
    expect(
      mockApplicationStaffJournalRepository.softRemove,
    ).toHaveBeenCalledTimes(1);
  });

  it('should set the edited flag when editing', async () => {
    mockApplicationService.getByUuidOrFail.mockResolvedValue(application);
    mockApplicationStaffJournalRepository.findOne.mockResolvedValue(note);
    mockApplicationStaffJournalRepository.save.mockResolvedValue(
      {} as ApplicationStaffJournal,
    );

    await service.update('note-uuid', 'new-body');

    expect(mockApplicationStaffJournalRepository.findOne).toHaveBeenCalledTimes(
      1,
    );
    expect(mockApplicationStaffJournalRepository.save).toHaveBeenCalledTimes(1);
    const savedData =
      mockApplicationStaffJournalRepository.save.mock.calls[0][0];
    expect(savedData.body).toEqual('new-body');
    expect(savedData.edited).toBeTruthy();
  });

  it('throw an exception when updating a note body with empty string', async () => {
    mockApplicationStaffJournalRepository.findOne.mockResolvedValue(note);

    await expect(service.update(note.uuid, '')).rejects.toMatchObject(
      new ServiceValidationException('note body must be filled.'),
    );
  });
});
