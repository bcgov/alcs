import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, InsertEvent, UpdateEvent } from 'typeorm';
import { ApplicationProposalStatusSubscriber } from './application-proposal-status.subscriber';
import { ApplicationProposal } from './application-proposal.entity';
import { ApplicationStatus } from './application-status/application-status.entity';

describe('ApplicationProposalStatusSubscriber', () => {
  let service: ApplicationProposalStatusSubscriber;
  let dataSource;
  let subscribers;

  beforeEach(async () => {
    subscribers = [];
    dataSource = createMock<DataSource>();
    dataSource.subscribers = subscribers;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationProposalStatusSubscriber,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ApplicationProposalStatusSubscriber>(
      ApplicationProposalStatusSubscriber,
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
    const app = new ApplicationProposal({
      status: new ApplicationStatus({
        code: 'code',
        description: '',
        label: mockLabel,
      }),
    });
    service.beforeInsert({
      entity: app,
    } as InsertEvent<ApplicationProposal>);

    expect(app.statusHistory.length).toEqual(1);
    expect(app.statusHistory[0].label).toEqual(mockLabel);
    expect(app.statusHistory[0].time).toBeDefined();
  });

  it('should add a new status on before update if status changes', () => {
    const oldLabel = 'old status';
    const newLabel = 'new status';

    const existingApp = new ApplicationProposal({
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

    const updateApp = new ApplicationProposal({
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
    } as unknown as UpdateEvent<ApplicationProposal>);

    expect(updateApp.statusHistory.length).toEqual(2);
    expect(updateApp.statusHistory[0].label).toEqual(oldLabel);
    expect(updateApp.statusHistory[0].time).toBeDefined();
    expect(updateApp.statusHistory[1].label).toEqual(newLabel);
    expect(updateApp.statusHistory[1].time).toBeDefined();
  });

  it("should leave the status alone if it isn't changed", () => {
    const existingLabel = 'old status';

    const existingApp = new ApplicationProposal({
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
    } as unknown as UpdateEvent<ApplicationProposal>);

    expect(existingApp.statusHistory.length).toEqual(1);
    expect(existingApp.statusHistory[0].label).toEqual(existingLabel);
    expect(existingApp.statusHistory[0].time).toBeDefined();
  });
});
