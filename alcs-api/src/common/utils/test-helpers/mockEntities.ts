import { ApplicationStatus } from '../../../application/application-status/application-status.entity';
import { Application } from '../../../application/application.entity';

const initApplicationStatusMockEntity = (): ApplicationStatus => {
  const applicationStatus = new ApplicationStatus();
  applicationStatus.code = 'app_1';
  applicationStatus.description = 'app desc 1';
  applicationStatus.uuid = '1111-1111-1111-1111';
  applicationStatus.auditDeletedDateAt = 11111111;
  applicationStatus.auditCreatedAt = 111111111;
  applicationStatus.auditUpdatedAt = 111111111;

  return applicationStatus;
};

const initApplicationMockEntity = (): Application => {
  const applicationEntity = new Application();
  applicationEntity.title = 'app_1';
  applicationEntity.fileNumber = 'app_1';
  applicationEntity.body = 'app desc 1';
  applicationEntity.uuid = '1111-1111-1111-1111';
  applicationEntity.auditDeletedDateAt = 111111111;
  applicationEntity.auditCreatedAt = 111111111;
  applicationEntity.auditUpdatedAt = 111111111;
  applicationEntity.status = initApplicationStatusMockEntity();
  applicationEntity.statusUuid = applicationEntity.status.uuid;

  return applicationEntity;
};

export { initApplicationStatusMockEntity, initApplicationMockEntity };
