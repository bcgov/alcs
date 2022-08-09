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
    mentionsList: new Set<MentionDto>(),
  };

  @Output() save = new EventEmitter<UpdateCommentDto>();
  @Output() create = new EventEmitter<CreateCommentDto>();
  @Output() cancel = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  mentionList: Set<MentionDto> = new Set();
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.$users.subscribe((users) => {
      this.users = users;
    });
  }

  onSave() {
    console.log('MentionTextareaComponent onSave', this.comment);
    this.isSaving = true;

    this.cleanUpSelectedUsers(this.comment.body);

    if (this.isNewComment) {
      this.create.emit({
        fileNumber: this.fileNumber,
        body: this.comment.body,
        mentionsList: this.mentionList,
      });
    } else {
      this.save.emit({
        uuid: this.comment.uuid,
        body: this.comment.body,
        mentionsList: this.mentionList,
      });
    }

    this.isSaving = false;
    this.isEditing = false;

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
    this.mentionList.add(<MentionDto>{
      mentionName: selectedUser.mentionName,
      userUuid: selectedUser.uuid,
    });

    console.log('onMentionUserSelected', selectedUser, this.mentionList);
  }

  private cleanUpSelectedUsers(commentBody: string) {
    for (let user of this.mentionList) {
      if (commentBody.indexOf(user.mentionName) === -1) {
        this.mentionList.delete(user);
      }
    }
  }
}
