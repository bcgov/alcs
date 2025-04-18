import { ApplicationDecisionOutcomeCode } from '../../src/alcs/application-decision/application-decision-outcome.entity';
import { ApplicationDecisionMeeting } from '../../src/alcs/application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecision } from '../../src/alcs/application-decision/application-decision.entity';
import { ApplicationModificationOutcomeType } from '../../src/alcs/application-decision/application-modification/application-modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationModification } from '../../src/alcs/application-decision/application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../../src/alcs/application-decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationOutcomeType } from '../../src/alcs/application-decision/application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from '../../src/alcs/application-decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { ApplicationMeeting } from '../../src/alcs/application/application-meeting/application-meeting.entity';
import { ApplicationPaused } from '../../src/alcs/application/application-paused.entity';
import { Application } from '../../src/alcs/application/application.entity';
import { Board } from '../../src/alcs/board/board.entity';
import { CardStatus } from '../../src/alcs/card/card-status/card-status.entity';
import { CardSubtaskType } from '../../src/alcs/card/card-subtask/card-subtask-type/card-subtask-type.entity';
import { CardSubtask } from '../../src/alcs/card/card-subtask/card-subtask.entity';
import { CardType } from '../../src/alcs/card/card-type/card-type.entity';
import { Card } from '../../src/alcs/card/card.entity';
import { ApplicationMeetingType } from '../../src/alcs/code/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegion } from '../../src/alcs/code/application-code/application-region/application-region.entity';
import { ApplicationType } from '../../src/alcs/code/application-code/application-type/application-type.entity';
import { Comment } from '../../src/alcs/comment/comment.entity';
import { CommentMention } from '../../src/alcs/comment/mention/comment-mention.entity';
import { AssigneeDto, UserDto } from '../../src/user/user.dto';
import { User } from '../../src/user/user.entity';
import { TagCategory } from '../../src/alcs/tag/tag-category/tag-category.entity';
import { Tag } from '../../src/alcs/tag/tag.entity';
import { NoticeOfIntent } from '../../src/alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentType } from '../../src/alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { ApplicationDecisionConditionCard } from '../../src/alcs/application-decision/application-decision-condition/application-decision-condition-card/application-decision-condition-card.entity';
import { ApplicationDecisionConditionType } from '../../src/alcs/application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionCondition } from '../../src/alcs/application-decision/application-decision-condition/application-decision-condition.entity';
import {
  ApplicationDecisionConditionFinancialInstrument,
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from '../../src/alcs/application-decision/application-decision-condition/application-decision-condition-financial-instrument/application-decision-condition-financial-instrument.entity';
import { NoticeOfIntentDecisionConditionFinancialInstrument } from '../../src/alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.entity';
import { NoticeOfIntentDecisionConditionType } from '../../src/alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';

const initCardStatusMockEntity = (): CardStatus => {
  const cardStatus = new CardStatus();
  cardStatus.code = 'status_1';
  cardStatus.description = 'app desc 1';
  cardStatus.label = 'app_label';
  cardStatus.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  cardStatus.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  cardStatus.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return cardStatus;
};

const initCardSubtaskMockEntity = (card: Card, uuid?: string): CardSubtask => {
  const subtask = new CardSubtask();
  subtask.assignee = initUserMockEntity();
  subtask.uuid = uuid ?? '11111';
  subtask.assigneeUuid = subtask.assignee.uuid;
  subtask.createdAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.card = card;
  subtask.type = new CardSubtaskType();
  subtask.type.backgroundColor = 'fake-bg-color';
  subtask.type.textColor = 'fake-color';
  subtask.type.code = 'fake-type';
  return subtask;
};

const initCardGISSubtaskMockEntity = (card: Card, uuid?: string): CardSubtask => {
  const subtask = new CardSubtask();
  subtask.assignee = initUserMockEntity();
  subtask.uuid = uuid ?? '11111';
  subtask.assigneeUuid = subtask.assignee.uuid;
  subtask.createdAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  subtask.card = card;
  subtask.type = new CardSubtaskType();
  subtask.type.backgroundColor = 'fake-bg-color';
  subtask.type.textColor = 'fake-color';
  subtask.type.code = 'GIS';
  return subtask;
};

const initBoardMockEntity = (): Board => {
  const board = new Board();
  board.uuid = 'fake-uuid';
  board.code = 'fake-code';
  return board;
};

const initCardTypeMockEntity = (): CardType => {
  const type = new CardType();
  type.code = 'fake-code';
  return type;
};

const initCardMockEntity = (subtaskUuid?: string): Card => {
  const card = new Card();
  card.highPriority = true;
  card.status = initCardStatusMockEntity();
  card.uuid = '1111-1111-1111-1112';
  card.assigneeUuid = '1111-1111-1111';
  card.assignee = initUserMockEntity();
  card.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  card.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  card.subtasks = [initCardSubtaskMockEntity(card, subtaskUuid)];
  card.board = initBoardMockEntity();
  card.boardUuid = card.board.uuid;
  card.type = initCardTypeMockEntity();
  card.createdAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return card;
};

const initApplicationTypeMockEntity = (): ApplicationType => {
  const applicationType = new ApplicationType();
  applicationType.code = 'type_1';
  applicationType.description = 'app desc 1';
  applicationType.label = 'app_label';
  applicationType.shortLabel = 'short_label';
  applicationType.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationType.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationType.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return applicationType;
};

const initNoticeOfIntentTypeMockEntity = (): NoticeOfIntentType => {
  const noticeOfIntentType = new NoticeOfIntentType();
  noticeOfIntentType.code = 'type_1';
  noticeOfIntentType.description = 'noi desc 1';
  noticeOfIntentType.label = 'noi_label';
  noticeOfIntentType.shortLabel = 'short_label';
  noticeOfIntentType.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  noticeOfIntentType.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  noticeOfIntentType.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return noticeOfIntentType;
};

const initUserMockEntity = (): User => {
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

const initApplicationReconsiderationMockEntity = (
  application?: Application,
  card?: Card,
): ApplicationReconsideration => {
  const reconsideration = new ApplicationReconsideration();
  const app = application ?? initApplicationMockEntity();
  reconsideration.application = app;
  reconsideration.applicationUuid = app.uuid;
  reconsideration.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  reconsideration.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  reconsideration.submittedDate = new Date(1, 1, 1, 1, 1, 1, 1);
  const cardEntity = card ?? initCardMockEntity('222');
  reconsideration.card = cardEntity;
  reconsideration.cardUuid = cardEntity.uuid;

  const reconsiderationType = new ApplicationReconsiderationType();
  reconsiderationType.code = '33';
  reconsiderationType.label = '33';
  reconsiderationType.description = '33';
  reconsideration.type = reconsiderationType;

  reconsideration.reviewOutcome = {
    label: 'mock',
    code: 'mock',
    description: 'mock',
  } as ApplicationReconsiderationOutcomeType;
  return reconsideration;
};

const initApplicationModificationMockEntity = (application?: Application, card?: Card): ApplicationModification => {
  const app = application ?? initApplicationMockEntity();
  const modification = new ApplicationModification({
    application: app,
    applicationUuid: app.uuid,
    auditCreatedAt: new Date(1, 1, 1, 1, 1, 1, 1),
    auditUpdatedAt: new Date(1, 1, 1, 1, 1, 1, 1),
    submittedDate: new Date(1, 1, 1, 1, 1, 1, 1),
    reviewOutcome: {
      label: 'mock',
      code: 'mock',
      description: 'mock',
    } as ApplicationModificationOutcomeType,
  });

  const cardEntity = card ?? initCardMockEntity('222');
  modification.card = cardEntity;
  modification.cardUuid = cardEntity.uuid;

  return modification;
};

const initApplicationMockEntity = (fileNumber?: string, uuid?: string): Application => {
  const applicationEntity = new Application();
  applicationEntity.fileNumber = fileNumber ?? 'app_1';
  applicationEntity.applicant = 'applicant 1';
  applicationEntity.uuid = uuid ?? '1111-1111-1111-1111';
  applicationEntity.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationEntity.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationEntity.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  applicationEntity.card = initCardMockEntity();
  applicationEntity.cardUuid = applicationEntity.card.uuid;
  applicationEntity.type = initApplicationTypeMockEntity();
  applicationEntity.card.highPriority = false;
  applicationEntity.region = {
    code: 'fake',
    label: 'fake',
    auditCreatedAt: new Date(1, 1, 1, 1, 1, 1, 1),
    auditUpdatedAt: new Date(1, 1, 1, 1, 1, 1, 1),
  } as ApplicationRegion;

  applicationEntity.reconsiderations = [initApplicationReconsiderationMockEntity(applicationEntity)];

  return applicationEntity;
};

const initNoticeOfIntentMockEntity = (fileNumber?: string): NoticeOfIntent => {
  const noticeOfIntentEntity = new NoticeOfIntent();
  noticeOfIntentEntity.fileNumber = fileNumber ?? 'app_1';
  noticeOfIntentEntity.applicant = 'applicant 1';
  noticeOfIntentEntity.uuid = '1111-1111-1111-1111';
  noticeOfIntentEntity.auditDeletedDateAt = new Date(1, 1, 1, 1, 1, 1, 1);
  noticeOfIntentEntity.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  noticeOfIntentEntity.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  noticeOfIntentEntity.card = initCardMockEntity();
  noticeOfIntentEntity.cardUuid = noticeOfIntentEntity.card.uuid;
  noticeOfIntentEntity.type = initNoticeOfIntentTypeMockEntity();
  noticeOfIntentEntity.card.highPriority = false;
  noticeOfIntentEntity.region = {
    code: 'fake',
    label: 'fake',
    auditCreatedAt: new Date(1, 1, 1, 1, 1, 1, 1),
    auditUpdatedAt: new Date(1, 1, 1, 1, 1, 1, 1),
  } as ApplicationRegion;

  return noticeOfIntentEntity;
};

const initApplicationWithTagsMockEntity = (): Application => {
  const applicationEntity = initApplicationMockEntity();
  const tagEntity = initTagMockEntity();
  applicationEntity.tags = [];
  applicationEntity.tags.push(tagEntity);
  return applicationEntity;
};

const initNoticeOfIntentWithTagsMockEntity = (): NoticeOfIntent => {
  const noticeOfIntentEntity = initNoticeOfIntentMockEntity();
  const tagEntity = initTagMockEntity();
  noticeOfIntentEntity.tags = [];
  noticeOfIntentEntity.tags.push(tagEntity);
  return noticeOfIntentEntity;
};

const initMockUserDto = (assignee?: User): UserDto => {
  const userEntity = assignee ?? initUserMockEntity();
  const userDto = new UserDto();
  userDto.uuid = 'user-uuid';

  userDto.identityProvider = userEntity.identityProvider;
  userDto.name = userEntity.name!;
  userDto.idirUserName = userEntity.idirUserName;
  userDto.initials = userEntity.givenName!.charAt(0).toUpperCase() + userEntity.familyName.charAt(0).toUpperCase();
  userDto.bceidUserName = undefined;

  return userDto;
};

const initMockAssigneeDto = (assignee?: User): AssigneeDto => {
  const userEntity = assignee ?? initUserMockEntity();
  const assigneeDto = new AssigneeDto();
  assigneeDto.uuid = userEntity.uuid;
  assigneeDto.name = userEntity.name;
  assigneeDto.initials = userEntity.givenName!.charAt(0).toUpperCase() + userEntity.familyName.charAt(0).toUpperCase();
  assigneeDto.mentionLabel =
    userEntity.givenName!.charAt(0).toUpperCase() +
    userEntity.givenName!.slice(1) +
    userEntity.familyName.charAt(0).toUpperCase() +
    userEntity.familyName.slice(1);
  assigneeDto.email = userEntity.email;
  return assigneeDto;
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

const initCommentMentionMock = (comment?: Comment, user?: User): CommentMention => {
  const mention = new CommentMention();
  const commentEntity = comment ?? initCommentMock();
  const userEntity = user ?? initUserMockEntity();
  mention.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  mention.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  mention.commentUuid = commentEntity.uuid;
  mention.user = userEntity;
  mention.mentionLabel = 'TestMentionName';

  return mention;
};

const initApplicationDecisionMeetingMock = (application?: Application): ApplicationDecisionMeeting => {
  const meeting = new ApplicationDecisionMeeting();
  meeting.application = application ?? initApplicationMockEntity();
  meeting.uuid = '11111111';
  meeting.date = new Date(2022, 1, 1, 1, 1, 1, 1);
  meeting.applicationUuid = application ? application.uuid : 'fake-application-uuid';

  return meeting;
};

const initApplicationDecisionMock = (application?: Application) => {
  return new ApplicationDecision({
    isDraft: false,
    outcome: {
      code: 'CODE',
      label: 'label',
    } as ApplicationDecisionOutcomeCode,
    date: new Date(),
    uuid: 'fake-outcome-uuid',
    applicationUuid: application ? application.uuid : 'fake-application-uuid',
    application,
    documents: [],
    conditions: [],
    components: [],
  });
};

const initApplicationMeetingMock = (
  application?: Application,
  meetingType?: ApplicationMeetingType,
): ApplicationMeeting => {
  const meeting = new ApplicationMeeting();
  meeting.application = application ?? initApplicationMockEntity();
  meeting.uuid = '11111111';
  meeting.applicationUuid = application ? application.uuid : 'fake-application-uuid';
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

const initTagCategoryMockEntity = (): TagCategory => {
  const category = new TagCategory();
  category.name = 'fake-name';
  return category;
};

const initTagMockEntity = (): Tag => {
  const tag = new Tag();
  tag.uuid = 'tag-uuid';
  tag.name = 'tag-name';
  tag.isActive = true;
  tag.category = initTagCategoryMockEntity();
  tag.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return tag;
};

const initMockApplicationDecisionConditionCard = (
  application?: Application,
  applicationDecision?: ApplicationDecision,
  card?: Card,
): ApplicationDecisionConditionCard => {
  const conditionCard = new ApplicationDecisionConditionCard();
  conditionCard.uuid = 'condition-card-uuid';
  if (application) {
    conditionCard.decision = initApplicationDecisionMock(application);
  } else {
    conditionCard.decision = applicationDecision ?? initApplicationDecisionMock();
  }
  conditionCard.card = card ?? initCardMockEntity();
  conditionCard.cardUuid = conditionCard.card.uuid;

  return conditionCard;
};

const initApplicationDecisionConditionTypeMockEntity = (code?: string): ApplicationDecisionConditionType => {
  const conditionType = new ApplicationDecisionConditionType();
  conditionType.code = code ? code : 'type_1';
  conditionType.description = 'condition desc 1';
  conditionType.label = 'condition_label';
  conditionType.isActive = true;
  conditionType.isComponentToConditionChecked = true;
  conditionType.isDescriptionChecked = true;
  conditionType.isAdministrativeFeeAmountChecked = false;
  conditionType.isAdministrativeFeeAmountRequired = null;
  conditionType.administrativeFeeAmount = null;
  conditionType.isDateChecked = false;
  conditionType.isDateRequired = null;
  conditionType.dateType = null;
  conditionType.singleDateLabel = null;
  conditionType.isSecurityAmountChecked = false;
  conditionType.isSecurityAmountRequired = null;
  conditionType.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  conditionType.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return conditionType;
};

const initApplicationDecisionConditionFinancialInstrumentMockEntity = (
  payee?: string,
  bank?: string,
  instrumentNumber?: string,
  condition?: ApplicationDecisionCondition,
): ApplicationDecisionConditionFinancialInstrument => {
  const instrument = new ApplicationDecisionConditionFinancialInstrument();
  instrument.securityHolderPayee = 'fake-payee';
  instrument.type = InstrumentType.BANK_DRAFT;
  instrument.issueDate = new Date(2022, 1, 1);
  instrument.expiryDate = new Date(2023, 1, 1);
  instrument.amount = 1000.0;
  instrument.bank = 'fake-bank';
  instrument.instrumentNumber = '123456';
  instrument.heldBy = HeldBy.ALC;
  instrument.receivedDate = new Date(2022, 1, 1);
  instrument.notes = 'fake-notes';
  instrument.status = InstrumentStatus.RECEIVED;
  instrument.statusDate = new Date(2022, 1, 1);
  instrument.explanation = 'fake-explanation';
  instrument.condition = condition ?? new ApplicationDecisionCondition();
  return instrument;
};

const initNoticeOfIntentDecisionConditionTypeMockEntity = (code?: string): NoticeOfIntentDecisionConditionType => {
  const conditionType = new NoticeOfIntentDecisionConditionType();
  conditionType.code = code ? code : 'type_1';
  conditionType.description = 'condition desc 1';
  conditionType.label = 'condition_label';
  conditionType.isActive = true;
  conditionType.isComponentToConditionChecked = true;
  conditionType.isDescriptionChecked = true;
  conditionType.isAdministrativeFeeAmountChecked = false;
  conditionType.isAdministrativeFeeAmountRequired = null;
  conditionType.administrativeFeeAmount = null;
  conditionType.isDateChecked = false;
  conditionType.isDateRequired = null;
  conditionType.dateType = null;
  conditionType.singleDateLabel = null;
  conditionType.isSecurityAmountChecked = false;
  conditionType.isSecurityAmountRequired = null;
  conditionType.auditCreatedAt = new Date(1, 1, 1, 1, 1, 1, 1);
  conditionType.auditUpdatedAt = new Date(1, 1, 1, 1, 1, 1, 1);

  return conditionType;
};

const initNoticeOfIntentDecisionConditionFinancialInstrumentMockEntity = (
  payee?: string,
  bank?: string,
  instrumentNumber?: string,
): NoticeOfIntentDecisionConditionFinancialInstrument => {
  const instrument = new NoticeOfIntentDecisionConditionFinancialInstrument();
  instrument.securityHolderPayee = 'fake-payee';
  instrument.type = InstrumentType.BANK_DRAFT;
  instrument.issueDate = new Date(2022, 1, 1);
  instrument.expiryDate = new Date(2023, 1, 1);
  instrument.amount = 1000.0;
  instrument.bank = 'fake-bank';
  instrument.instrumentNumber = '123456';
  instrument.heldBy = HeldBy.ALC;
  instrument.receivedDate = new Date(2022, 1, 1);
  instrument.notes = 'fake-notes';
  instrument.status = InstrumentStatus.RECEIVED;
  instrument.statusDate = new Date(2022, 1, 1);
  instrument.explanation = 'fake-explanation';
  return instrument;
};

export {
  initCardStatusMockEntity,
  initApplicationMockEntity,
  initMockAssigneeDto,
  initMockUserDto,
  initUserMockEntity,
  initApplicationTypeMockEntity,
  initCommentMentionMock,
  initCommentMock,
  initApplicationDecisionMeetingMock,
  initApplicationMeetingMock,
  initCardMockEntity,
  initCardSubtaskMockEntity,
  initCardGISSubtaskMockEntity,
  initBoardMockEntity,
  initCardTypeMockEntity,
  initApplicationDecisionMock,
  initApplicationReconsiderationMockEntity,
  initApplicationModificationMockEntity,
  initTagCategoryMockEntity,
  initTagMockEntity,
  initApplicationWithTagsMockEntity,
  initNoticeOfIntentMockEntity,
  initNoticeOfIntentWithTagsMockEntity,
  initMockApplicationDecisionConditionCard,
  initApplicationDecisionConditionTypeMockEntity,
  initApplicationDecisionConditionFinancialInstrumentMockEntity,
  initNoticeOfIntentDecisionConditionTypeMockEntity,
  initNoticeOfIntentDecisionConditionFinancialInstrumentMockEntity,
};
