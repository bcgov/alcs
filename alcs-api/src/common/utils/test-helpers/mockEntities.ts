import { ApplicationType } from '../../../application/application-code/application-type/application-type.entity';
import { ApplicationStatus } from '../../../application/application-status/application-status.entity';
import { Application } from '../../../application/application.entity';
import { Comment } from '../../../comment/comment.entity';
import { CommentMention } from '../../../comment/mention/comment-mention.entity';
import { UserDto } from '../../../user/user.dto';
import { User } from '../../../user/user.entity';

const initApplicationStatusMockEntity = (): ApplicationStatus => {
  const applicationStatus = new ApplicationStatus();
  applicationStatus.code = 'status_1';
  applicationStatus.description = 'app desc 1';
  applicationStatus.uuid = '1111-1111-1111-1111';
  applicationStatus.label = 'app_label';
  applicationStatus.auditDeletedDateAt = 11111111;
  applicationStatus.auditCreatedAt = 111111111;
  applicationStatus.auditUpdatedAt = 111111111;

  return applicationStatus;
};

const initApplicationTypeMockEntity = (): ApplicationType => {
  const applicationType = new ApplicationType();
  applicationType.code = 'type_1';
  applicationType.description = 'app desc 1';
  applicationType.uuid = '1111-1111-1111-1111';
  applicationType.label = 'app_label';
  applicationType.shortLabel = 'short_label';
  applicationType.auditDeletedDateAt = 11111111;
  applicationType.auditCreatedAt = 111111111;
  applicationType.auditUpdatedAt = 111111111;

  return applicationType;
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

const initApplicationMockEntity = (fileNumber?: string): Application => {
  const applicationEntity = new Application();
  applicationEntity.fileNumber = fileNumber ?? 'app_1';
  applicationEntity.applicant = 'applicant 1';
  applicationEntity.uuid = '1111-1111-1111-1111';
  applicationEntity.auditDeletedDateAt = 111111111;
  applicationEntity.auditCreatedAt = 111111111;
  applicationEntity.auditUpdatedAt = 111111111;
  applicationEntity.status = initApplicationStatusMockEntity();
  applicationEntity.statusUuid = applicationEntity.status.uuid;
  applicationEntity.assigneeUuid = '1111-1111-1111';
  applicationEntity.assignee = initAssigneeMockEntity();
  applicationEntity.paused = false;
  applicationEntity.type = initApplicationTypeMockEntity();
  applicationEntity.highPriority = false;

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
  userDto.bceidUserName = undefined;
  userDto.bceidGuid = undefined;
  userDto.mentionName =
    userEntity.givenName.charAt(0).toUpperCase() +
    userEntity.givenName.slice(1) +
    userEntity.familyName.charAt(0).toUpperCase() +
    userEntity.familyName.slice(1);
  return userDto;
};

const initCommentMock = (author?: any): Comment => {
  const comment = new Comment({
    body: 'body',
    author:
      author ??
      ({
        uuid: 'aaaaaaaaaaaaaaaa',
        email: 'fake-email',
        name: 'fake-name',
      } as any),
    createdAt: new Date(),
    application: initApplicationMockEntity('file-number'),
    applicationUuid: 'file-number',
    edited: false,
    uuid: '11111111111111111',
  });

  comment.mentions = [initCommentMentionMock(comment)];

  return comment;
};

const initCommentMentionMock = (
  comment?: Comment,
  user?: User,
): CommentMention => {
  const mention = new CommentMention();
  const commentEntity = comment ?? initCommentMock();
  const userEntity = user ?? initAssigneeMockEntity();
  mention.auditCreatedAt = 111111111;
  mention.auditUpdatedAt = 111111111;
  mention.commentUuid = commentEntity.uuid;
  mention.user = userEntity;
  mention.mentionLabel = 'TestMentionName';

  return mention;
};

export {
  initApplicationStatusMockEntity,
  initApplicationMockEntity,
  initAssigneeMockDto,
  initApplicationTypeMockEntity,
  initCommentMentionMock,
  initCommentMock,
};
