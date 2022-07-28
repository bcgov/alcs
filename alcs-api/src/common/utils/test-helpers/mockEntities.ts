import { ApplicationStatus } from '../../../application/application-status/application-status.entity';
import { Application } from '../../../application/application.entity';
import { User } from '../../../user/user.entity';

const initApplicationStatusMockEntity = (): ApplicationStatus => {
  const applicationStatus = new ApplicationStatus();
  applicationStatus.code = 'app_1';
  applicationStatus.description = 'app desc 1';
  applicationStatus.uuid = '1111-1111-1111-1111';
  applicationStatus.label = 'app_label';
  applicationStatus.auditDeletedDateAt = 11111111;
  applicationStatus.auditCreatedAt = 111111111;
  applicationStatus.auditUpdatedAt = 111111111;

  return applicationStatus;
};

const initAssigneeMockEntity = (): User => {
  const applicationStatus = new User();
  applicationStatus.familyName = 'familyName';
  applicationStatus.email = 'email_1@emai.com';
  applicationStatus.uuid = '1111-1111-1111-1111';
  applicationStatus.givenName = 'givenName';
  applicationStatus.identityProvider = 'identityProvider';
  applicationStatus.name = 'name';
  applicationStatus.displayName = 'displayName';
  applicationStatus.preferredUsername = 'preferredUsername';
  applicationStatus.idirUserGuid = 'idirUserGuid';
  applicationStatus.idirUserName = 'idirUserName';
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
  applicationEntity.assigneeUuid = '1111-1111-1111';
  applicationEntity.assignee = initAssigneeMockEntity();
  applicationEntity.paused = false;

  return applicationEntity;
};

export { initApplicationStatusMockEntity, initApplicationMockEntity };
