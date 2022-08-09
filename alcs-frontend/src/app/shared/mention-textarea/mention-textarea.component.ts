import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommentDto, CreateCommentDto, MentionDto, UpdateCommentDto } from '../../services/comment/comment.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-mention-textarea',
  templateUrl: './mention-textarea.component.html',
  styleUrls: ['./mention-textarea.component.scss'],
})
export class MentionTextareaComponent implements OnInit {
  @Input() fileNumber!: string;
  @Input() isSaving = false;
  @Input() isEditing = false;
  @Input() isNewComment = false;
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
  @Output() create = new EventEmitter<CreateCommentDto>();
  @Output() cancel = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  mentionList: Map<string, MentionDto> = new Map<string, MentionDto>();
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.$users.subscribe((users) => {
      this.users = users;
    });

    if (this.comment.mentions) {
      for (let mention of this.comment.mentions) {
        this.mentionList.set(mention.userUuid, mention);
      }
    }
  }

  onSave() {
    console.log('MentionTextareaComponent onSave', this.comment);
    this.isSaving = true;

    this.cleanUpSelectedUsers(this.comment.body);

    if (this.isNewComment) {
      this.create.emit({
        fileNumber: this.fileNumber,
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

    this.isSaving = false;
    this.isEditing = false;
    this.mentionList = new Map<string, MentionDto>();

    if (this.isNewComment) {
      this.comment.body = '';
    }
  }

  onCancel() {
    console.log('MentionTextareaComponent onCancel');
    this.isEditing = false;
    this.cancel.emit();
  }

  onEdit() {
    this.isEditing = true;
    console.log('MentionTextareaComponent onEdit', this.isEditing);

    setTimeout(() => {
      this.textAreaDiv.nativeElement.focus();
    });
  }

  onMentionUserSelected(selectedUser: any) {
    // avoid adding duplicates
    if (this.mentionList.has(selectedUser.uuid)) {
      return;
    }

    this.mentionList.set(selectedUser.uuid, {
      mentionName: selectedUser.mentionName,
      userUuid: selectedUser.uuid,
    });
  }

  private cleanUpSelectedUsers(commentBody: string) {
    // cleanup selected users list based on the comment body
    for (let user of this.mentionList) {
      if (user[0] && user[1]?.mentionName && commentBody.indexOf(user[1].mentionName) === -1) {
        this.mentionList.delete(user[0]);
      }
    }
  }
}
