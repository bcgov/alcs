export interface MentionDto {
  mentionName: string;
  userUuid: string;
}
export interface CommentDto {
  uuid: string;
  body: string;
  author: string;
  edited: boolean;
  createdAt: number;
  isEditable: boolean;
  mentionsList: Set<MentionDto>;
}

export interface CreateCommentDto {
  fileNumber: string;
  body: string;
  mentionsList: Set<MentionDto>;
}

export interface UpdateCommentDto {
  uuid: string;
  body: string;
  mentionsList: Set<MentionDto>;
}
