export interface MentionDto {
  mentionLabel: string;
  userUuid: string;
}

export interface CommentDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
  mentions: MentionDto[];
}

export interface CreateCommentDto {
  cardUuid: string;
  body: string;
  notificationTitle: string;
  mentions: Map<string, MentionDto>;
}

export interface UpdateCommentDto {
  uuid: string;
  body: string;
  notificationTitle: string;
  mentions: Map<string, MentionDto>;
}
