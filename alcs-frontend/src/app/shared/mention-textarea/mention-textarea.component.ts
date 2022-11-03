import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommentDto, MentionDto, UpdateCommentDto } from '../../services/comment/comment.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-mention-textarea',
  templateUrl: './mention-textarea.component.html',
  styleUrls: ['./mention-textarea.component.scss'],
})
export class MentionTextareaComponent implements OnInit {
  @Input() isNewComment = false;
  @Input() labelText = '';
  @Input() comment: CommentDto = {
    body: '',
    uuid: '',
    author: '',
    edited: false,
    createdAt: 0,
    isEditable: false,
    mentions: [],
  };

  @Output() save = new EventEmitter<UpdateCommentDto>();
  @Output() create = new EventEmitter();
  @Output() cancel = new EventEmitter<string>();

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  isSaving = false;
  mentionList: Map<string, MentionDto> = new Map<string, MentionDto>();
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.$assignableUsers.subscribe((users) => {
      this.users = users;
    });

    if (this.comment.mentions) {
      for (let mention of this.comment.mentions) {
        this.mentionList.set(mention.userUuid, mention);
      }
    }

    setTimeout(() => {
      this.textAreaDiv.nativeElement.focus();
    });
  }

  onSave() {
    this.isSaving = true;

    this.cleanUpSelectedUsers(this.comment.body);

    if (this.isNewComment) {
      this.create.emit({
        body: this.comment.body,
        mentions: this.mentionList,
      });
    } else {
      this.save.emit({
        uuid: this.comment.uuid,
        body: this.comment.body,
        mentions: this.mentionList,
      });
    }

    this.clear();
  }

  private clear() {
    this.isSaving = false;
    this.mentionList.clear();

    if (this.isNewComment) {
      this.comment.body = '';
    }
  }

  onCancel() {
    this.clear();
    this.cancel.emit();
  }

  onMentionUserSelected(selectedUser: any) {
    // avoid adding duplicates
    if (this.mentionList.has(selectedUser.uuid)) {
      return;
    }

    this.mentionList.set(selectedUser.uuid, {
      mentionLabel: selectedUser.mentionLabel,
      userUuid: selectedUser.uuid,
    });
  }

  private cleanUpSelectedUsers(commentBody: string) {
    // cleanup selected users list based on the comment body
    for (let user of this.mentionList) {
      if (user[0] && user[1]?.mentionLabel && commentBody.indexOf(user[1].mentionLabel) === -1) {
        this.mentionList.delete(user[0]);
      }
    }
  }
}
