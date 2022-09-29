import { ApplicationMeetingType } from '../../../application/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationType } from '../../../application/application-code/application-type/application-type.entity';
import { ApplicationDecisionMeeting } from '../../../application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationMeeting } from '../../../application/application-meeting/application-meeting.entity';
import { ApplicationPaused } from '../../../application/application-paused.entity';
import { Application } from '../../../application/application.entity';
import { CardStatus } from '../../../card/card-status/card-status.entity';
import { CardSubtaskType } from '../../../card/card-subtask/card-subtask-type/card-subtask-type.entity';
import { CardSubtask } from '../../../card/card-subtask/card-subtask.entity';
import { Card } from '../../../card/card.entity';
import { Comment } from '../../../comment/comment.entity';
import { CommentMention } from '../../../comment/mention/comment-mention.entity';
import { UserDto } from '../../../user/user.dto';
import { User } from '../../../user/user.entity';

const initCardStatusMockEntity = (): CardStatus => {
  const cardStatus = new CardStatus();
  cardStatus.code = 'status_1';
  cardStatus.description = 'app desc 1';
  cardStatus.uuid = '1111-1111-1111-1111';
  cardStatus.label = 'app_label';
  cardStatus.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  cardStatus.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  cardStatus.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return cardStatus;
};

const initCardSubtaskMockEntity = (card?: Card): CardSubtask => {
  const subtask = new CardSubtask();
  (subtask.assignee = initAssigneeMockEntity()), (subtask.uuid = '11111');
  subtask.assigneeUuid = subtask.assignee.uuid;
  subtask.createdAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.card = card ?? new Card();
  subtask.type = new CardSubtaskType();
  subtask.type.backgroundColor = 'fake-bg-color';
  subtask.type.textColor = 'fake-color';
  subtask.type.type = 'fake-type';
  return subtask;
};

const initCardMockEntity = (): Card => {
  const card = new Card();
  card.highPriority = true;
  card.status = initCardStatusMockEntity();
  card.statusUuid = '1111-1111-1111-1111';
  card.uuid = '1111-1111-1111-1111';
  card.assigneeUuid = '1111-1111-1111';
  card.assignee = initAssigneeMockEntity();
  card.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  card.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  card.subtasks = [initCardSubtaskMockEntity(card)];

  return card;
};

const initApplicationTypeMockEntity = (): ApplicationType => {
  const applicationType = new ApplicationType();
  applicationType.code = 'type_1';
  applicationType.description = 'app desc 1';
  applicationType.uuid = '1111-1111-1111-1111';
  applicationType.label = 'app_label';
  applicationType.shortLabel = 'short_label';
  applicationType.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationType.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationType.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

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
  user.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  user.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  return user;
};

const initApplicationMockEntity = (fileNumber?: string): Application => {
  const applicationEntity = new Application();
  applicationEntity.fileNumber = fileNumber ?? 'app_1';
  applicationEntity.applicant = 'applicant 1';
  applicationEntity.uuid = '1111-1111-1111-1111';
  applicationEntity.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationEntity.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationEntity.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationEntity.card = initCardMockEntity();
  applicationEntity.type = initApplicationTypeMockEntity();
  applicationEntity.card.highPriority = false;

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
  userDto.mentionLabel =
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
    card: initCardMockEntity(),
    cardUuid: 'file-number',
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
  mention.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  mention.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  mention.commentUuid = commentEntity.uuid;
  mention.user = userEntity;
  mention.mentionLabel = 'TestMentionName';

  return mention;
};

const initApplicationDecisionMeetingMock = (
  application?: Application,
): ApplicationDecisionMeeting => {
  const meeting = new ApplicationDecisionMeeting();
  meeting.application = application ?? initApplicationMockEntity();
  meeting.uuid = '11111111';
  meeting.date = new Date(2022, 1, 1, 1, 1, 1, 1);
  meeting.applicationUuid = application.uuid;

  return meeting;
};

const initApplicationMeetingMock = (
  application?: Application,
  meetingType?: ApplicationMeetingType,
): ApplicationMeeting => {
  const meeting = new ApplicationMeeting();
  meeting.application = application ?? initApplicationMockEntity();
  meeting.uuid = '11111111';
  meeting.applicationUuid = application.uuid;
  if (meetingType) {
    meeting.type = meetingType;
  } else {
    meeting.type = new ApplicationMeetingType();
    meeting.type.code = meeting.type.code = 'FC';
    meeting.type.label = 'Fake code';
    meeting.type.description = 'Fake description';
  }
  meeting.meetingPause = {
    startDate: new Date(),
    endDate: new Date(),
  } as ApplicationPaused;

  return meeting;
};

export {
  initCardStatusMockEntity,
  initApplicationMockEntity,
  initAssigneeMockDto,
  initAssigneeMockEntity,
  initApplicationTypeMockEntity,
  initCommentMentionMock,
  initCommentMock,
  initApplicationDecisionMeetingMock,
  initApplicationMeetingMock,
  initCardMockEntity,
  initCardSubtaskMockEntity,
};
