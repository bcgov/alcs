import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationProfile } from '../../../common/automapper/application.automapper.profile';
import { User } from '../../../user/user.entity';
import { Application } from '../application.entity';
import { ApplicationStaffJournalController } from './application-staff-journal.controller';
import { ApplicationStaffJournal } from './application-staff-journal.entity';
import { ApplicationStaffJournalService } from './application-staff-journal.service';

describe('ApplicationStaffJournalController', () => {
  let controller: ApplicationStaffJournalController;
  let mockApplicationStaffJournalService: DeepMocked<ApplicationStaffJournalService>;

  let note;
  let user;
  let request;

  beforeEach(async () => {
    mockApplicationStaffJournalService = createMock();

    user = {
      name: 'Bruce Wayne',
      email: 'fake-email',
      uuid: 'user-uuid',
    };
    note = {
      body: 'fake',
      uuid: 'fakeUuid',
      application: { uuid: 'fake_application_uuid' } as Application,
      author: user as User,
    } as ApplicationStaffJournal;

    request = {
      user: {
        ...user,
        entity: user,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationStaffJournalService,
          useValue: mockApplicationStaffJournalService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [ApplicationStaffJournalController],
    }).compile();

    controller = module.get<ApplicationStaffJournalController>(
      ApplicationStaffJournalController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should correctly map the author and editable fields', async () => {
    mockApplicationStaffJournalService.fetch.mockResolvedValue([note]);

    const notes = await controller.get('file-number', request);

    expect(notes.length).toEqual(1);
    expect(notes[0].author).toStrictEqual(note.author.name);
    expect(notes[0].isEditable).toEqual(true);
  });

  it('should pass the new note to the service', async () => {
    mockApplicationStaffJournalService.create.mockResolvedValue(note);

    await controller.create(
      {
        body: 'note-body',
        applicationUuid: 'fake',
      },
      request,
    );

    expect(mockApplicationStaffJournalService.create).toHaveBeenCalledTimes(1);
    const passedData = mockApplicationStaffJournalService.create.mock.calls[0];
    expect(passedData[0]).toEqual('fake');
    expect(passedData[1]).toEqual('note-body');
  });

  it('should update the note when it exists and its the same user', async () => {
    mockApplicationStaffJournalService.get.mockResolvedValue(note);
    mockApplicationStaffJournalService.update.mockResolvedValue(note);

    await controller.update(
      {
        body: 'new-body',
        uuid: 'uuid',
      },
      request,
    );

    expect(mockApplicationStaffJournalService.update).toHaveBeenCalledTimes(1);
    const passedData = mockApplicationStaffJournalService.update.mock.calls[0];
    expect(passedData[1]).toEqual('new-body');
    expect(passedData[0]).toEqual('uuid');
  });

  it("should throw an exception when trying to update a note that doesn't exist", async () => {
    mockApplicationStaffJournalService.get.mockResolvedValue(null);
    mockApplicationStaffJournalService.update.mockResolvedValue(note);

    await expect(
      controller.update(
        {
          body: 'new-body',
          uuid: 'uuid',
        },
        request,
      ),
    ).rejects.toMatchObject({
      message: 'Note uuid not found',
      name: 'NotFoundException',
      options: {},
      response: {
        error: 'Not Found',
        message: 'Note uuid not found',
        statusCode: 404,
      },
      status: 404,
    });

    expect(mockApplicationStaffJournalService.update).not.toHaveBeenCalled();
  });

  it('should throw a forbidden exception when trying to update another users note', async () => {
    mockApplicationStaffJournalService.get.mockResolvedValue(note);
    mockApplicationStaffJournalService.update.mockResolvedValue(note);
    request.user = {
      ...user,
      entity: {
        uuid: 'another-user-uuid',
      },
    };

    await expect(
      controller.update(
        {
          body: 'new-body',
          uuid: 'uuid',
        },
        request,
      ),
    ).rejects.toMatchObject(
      new ForbiddenException(`Unable to delete others notes`),
    );
    expect(mockApplicationStaffJournalService.update).not.toHaveBeenCalled();
  });

  it('should delete the note when it exists and its the same user', async () => {
    mockApplicationStaffJournalService.get.mockResolvedValue(note);
    mockApplicationStaffJournalService.delete.mockResolvedValue(note);

    await controller.softDelete('uuid', request);

    expect(mockApplicationStaffJournalService.delete).toHaveBeenCalledTimes(1);
    const passedData = mockApplicationStaffJournalService.delete.mock.calls[0];
    expect(passedData[0]).toEqual('uuid');
  });

  it("should throw an exception when trying to delete a note that doesn't exist", async () => {
    mockApplicationStaffJournalService.get.mockResolvedValue(null);
    mockApplicationStaffJournalService.delete.mockResolvedValue(note);

    await expect(controller.softDelete('uuid', request)).rejects.toMatchObject({
      message: 'Note uuid not found',
      name: 'NotFoundException',
      options: {},
      response: {
        error: 'Not Found',
        message: 'Note uuid not found',
        statusCode: 404,
      },
      status: 404,
    });

    expect(mockApplicationStaffJournalService.delete).not.toHaveBeenCalled();
  });

  it('should throw a forbidden exception when trying to delete another users note', async () => {
    mockApplicationStaffJournalService.get.mockResolvedValue(note);
    mockApplicationStaffJournalService.delete.mockResolvedValue(note);
    request.user = {
      ...user,
      entity: {
        uuid: 'another-user-uuid',
      },
    };

    await expect(controller.softDelete('uuid', request)).rejects.toMatchObject(
      new ForbiddenException(`Unable to delete others notes`),
    );
    expect(mockApplicationStaffJournalService.delete).not.toHaveBeenCalled();
  });
});
