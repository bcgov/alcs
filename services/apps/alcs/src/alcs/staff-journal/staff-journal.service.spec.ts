import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { User } from '../../user/user.entity';
import { StaffJournal } from './staff-journal.entity';
import { StaffJournalService } from './staff-journal.service';

describe('ApplicationStaffJournalService', () => {
  let service: StaffJournalService;
  let mockApplicationStaffJournalRepository: DeepMocked<
    Repository<StaffJournal>
  >;

  let note;
  let user;

  beforeEach(async () => {
    mockApplicationStaffJournalRepository = createMock();

    user = {
      name: 'Bruce Wayne',
      email: 'fake-email',
      uuid: 'user-uuid',
    } as User;

    note = new StaffJournal({
      body: 'fake',
      uuid: 'note-uuid',
      author: user as User,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffJournalService,
        {
          provide: getRepositoryToken(StaffJournal),
          useValue: mockApplicationStaffJournalRepository,
        },
      ],
    }).compile();

    service = module.get<StaffJournalService>(StaffJournalService);
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

  it('should save the application note with the user', async () => {
    mockApplicationStaffJournalRepository.save.mockResolvedValue(
      {} as StaffJournal,
    );

    await service.createForApplication('fake-uuid', 'new-note', user);

    expect(mockApplicationStaffJournalRepository.save).toHaveBeenCalledTimes(1);
    const savedData =
      mockApplicationStaffJournalRepository.save.mock.calls[0][0];
    expect(savedData.author).toEqual(user);
    expect(savedData.body).toEqual('new-note');
  });

  it('should save the notice of intent note with the user', async () => {
    mockApplicationStaffJournalRepository.save.mockResolvedValue(
      {} as StaffJournal,
    );

    await service.createForNoticeOfIntent('fake-uuid', 'new-note', user);

    expect(mockApplicationStaffJournalRepository.save).toHaveBeenCalledTimes(1);
    const savedData =
      mockApplicationStaffJournalRepository.save.mock.calls[0][0];
    expect(savedData.author).toEqual(user);
    expect(savedData.body).toEqual('new-note');
  });

  it('should call soft remove when deleting', async () => {
    mockApplicationStaffJournalRepository.findOne.mockResolvedValue(note);
    mockApplicationStaffJournalRepository.softRemove.mockResolvedValue(
      {} as StaffJournal,
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
    mockApplicationStaffJournalRepository.findOne.mockResolvedValue(note);
    mockApplicationStaffJournalRepository.save.mockResolvedValue(
      {} as StaffJournal,
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
