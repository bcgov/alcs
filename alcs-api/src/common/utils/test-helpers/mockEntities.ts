import { ApplicationStatus } from '../../../application-status/application-status.entity';
import { Application } from '../../../application/application.entity';

const initApplicationStatusMockEntity = (): ApplicationStatus => {
  const applicationStatus = new ApplicationStatus();
  applicationStatus.code = 'app_1';
  applicationStatus.description = 'app desc 1';
  applicationStatus.id = '1111-1111-1111-1111';
  applicationStatus.auditDeletedDateAt = new Date(2022, 1, 1, 1, 1, 1, 1);
  applicationStatus.auditCreatedAt = 111111111;
  applicationStatus.auditUpdatedAt = 111111111;

  return applicationStatus;
};

const initApplicationMockEntity = (): Application => {
  const applicationEntity = new Application();
  applicationEntity.title = 'app_1';
  applicationEntity.number = 'app_1';
  applicationEntity.body = 'app desc 1';
  applicationEntity.id = '1111-1111-1111-1111';
  applicationEntity.auditDeletedDateAt = new Date(2022, 1, 1, 1, 1, 1, 1);
  applicationEntity.auditCreatedAt = 111111111;
  applicationEntity.auditUpdatedAt = 111111111;
  applicationEntity.status = initApplicationStatusMockEntity();
  applicationEntity.statusId = applicationEntity.status.id;

  return applicationEntity;
};

export { initApplicationStatusMockEntity, initApplicationMockEntity };
