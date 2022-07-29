import { ApplicationStatus } from '../../../application/application-status/application-status.entity';
import { Application } from '../../../application/application.entity';
import { UserDto } from '../../../user/user.dto';
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
  const user = new User();
  user.familyName = 'familyName';
  user.email = 'email_1@emai.com';
  user.uuid = '1111-1111-1111-1111';
  user.givenName = 'givenName';
  user.identityProvider = 'identityProvider';
  user.name = 'name';
  user.displayName = 'displayName';
  user.preferredUsername = 'preferredUsername';
  user.idirUserGuid = 'idirUserGuid';
  user.idirUserName = 'idirUserName';
  user.auditCreatedAt = 111111111;
  user.auditUpdatedAt = 111111111;
  return user;
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

const initAssigneeMockDto = (assignee?: User): UserDto => {
  const userEntity = assignee ?? initAssigneeMockEntity();
  const userDto = new UserDto();
  userDto.familyName = userEntity.familyName;
  userDto.email = userEntity.email;
  userDto.uuid = userEntity.uuid;
  userDto.givenName = userEntity.givenName;
  userDto.identityProvider = userEntity.identityProvider;
  userDto.name = userEntity.name;
  userDto.displayName = userEntity.displayName;
  userDto.preferredUsername = userEntity.preferredUsername;
  userDto.idirUserGuid = userEntity.idirUserGuid;
  userDto.idirUserName = userEntity.idirUserName;
  userDto.initials =
    userEntity.givenName.charAt(0).toUpperCase() +
    userEntity.familyName.charAt(0).toUpperCase();
  return userDto;
};

export {
  initApplicationStatusMockEntity,
  initApplicationMockEntity,
  initAssigneeMockDto,
};
