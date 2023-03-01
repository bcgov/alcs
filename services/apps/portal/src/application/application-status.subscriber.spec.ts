import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, InsertEvent, UpdateEvent } from 'typeorm';
import { ApplicationStatusSubscriber } from './application-status.subscriber';
import { ApplicationStatus } from './application-status/application-status.entity';
import { Application } from './application.entity';

describe('ApplicationStatusSubscriber', () => {
  let service: ApplicationStatusSubscriber;
  let dataSource;
  let subscribers;

  beforeEach(async () => {
    subscribers = [];
    dataSource = createMock<DataSource>();
    dataSource.subscribers = subscribers;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationStatusSubscriber,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ApplicationStatusSubscriber>(
      ApplicationStatusSubscriber,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe itself on init', () => {
    expect(subscribers.length).toEqual(1);
  });

  it('should set the initial event history before insert', () => {
    const mockLabel = 'mock status';
    const app = new Application({
      status: new ApplicationStatus({
        code: 'code',
        description: '',
        label: mockLabel,
      }),
    });
    service.beforeInsert({
      entity: app,
    } as InsertEvent<Application>);

    expect(app.statusHistory.length).toEqual(1);
    expect(app.statusHistory[0].label).toEqual(mockLabel);
    expect(app.statusHistory[0].time).toBeDefined();
  });

  it('should add a new status on before update if status changes', () => {
    const oldLabel = 'old status';
    const newLabel = 'new status';

    const existingApp = new Application({
      status: new ApplicationStatus({
        code: 'old-status',
        description: '',
        label: oldLabel,
      }),
      statusCode: oldLabel,
      statusHistory: [
        { description: '', label: oldLabel, time: 1, type: 'status_change' },
      ],
    });

    const updateApp = new Application({
      status: new ApplicationStatus({
        code: 'new-status',
        description: '',
        label: newLabel,
      }),
      statusHistory: [
        { description: '', label: oldLabel, time: 1, type: 'status_change' },
      ],
    });
    service.beforeUpdate({
      entity: updateApp,
      databaseEntity: existingApp,
    } as unknown as UpdateEvent<Application>);

    expect(updateApp.statusHistory.length).toEqual(2);
    expect(updateApp.statusHistory[0].label).toEqual(oldLabel);
    expect(updateApp.statusHistory[0].time).toBeDefined();
    expect(updateApp.statusHistory[1].label).toEqual(newLabel);
    expect(updateApp.statusHistory[1].time).toBeDefined();
  });

  it("should leave the status alone if it isn't changed", () => {
    const existingLabel = 'old status';

    const existingApp = new Application({
      status: new ApplicationStatus({
        code: 'code',
        description: '',
        label: existingLabel,
      }),
      statusCode: 'code',
      statusHistory: [
        {
          description: '',
          label: existingLabel,
          time: 1,
          type: 'status_change',
        },
      ],
    });

    service.beforeUpdate({
      entity: existingApp,
      databaseEntity: existingApp,
    } as unknown as UpdateEvent<Application>);

    expect(existingApp.statusHistory.length).toEqual(1);
    expect(existingApp.statusHistory[0].label).toEqual(existingLabel);
    expect(existingApp.statusHistory[0].time).toBeDefined();
  });
});
