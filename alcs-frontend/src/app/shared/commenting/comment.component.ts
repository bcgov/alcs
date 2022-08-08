import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as dayjs from 'dayjs';
import { CommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() comment!: CommentDto;

  @Input()
  users: any[] = [];

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<UpdateCommentDto>();

  // TODO: create am interface for this
  @Output() mentionsList: Set<string> = new Set();

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  commentDate = '';
  editComment = '';
  isEditing = false;

  constructor() {}

  ngOnInit(): void {
    this.commentDate = dayjs(this.comment.createdAt).format('MMM D, h:mm a');
  }

  onDelete() {
    this.delete.emit(this.comment.uuid);
  }

  onEdit() {
    this.isEditing = true;
    this.editComment = this.comment.body;
    this.mentionsList = this.getAllMentions(this.editComment);
    console.log('onEdit', this.mentionsList);

    setTimeout(() => {
      this.textAreaDiv.nativeElement.focus();
    });
  }

  private getAllMentions(value: string): Set<string> {
    const regex = /(?<=\@)\w+/g;
    return new Set(value.match(regex));
  }

  onCancel() {
    this.isEditing = false;
  }

  onSave() {
    this.edit.emit({
      uuid: this.comment.uuid,
      body: this.editComment,
      mentionsList: [...this.mentionsList],
    });
  }

  highlightMentions(value: string) {
    const mentions = this.getAllMentions(value);

    for (let mention of mentions) {
      console.log('highlightMentions', mention, this.users);
      const rgx = new RegExp('@' + mention, 'g');
      if (this.users.some((u: { mentionName: string }) => u.mentionName === mention)) {
        value = value.replace(rgx, () => `<span class="mention green">@${mention}</span> &nbsp`);
      } else {
        value = value.replace(rgx, () => `<span class="mention grey">@${mention}</span> &nbsp`);
      }
    }

    return value;
  }

  // private getMentionsList() {
  //   const mentionsList: string[] = [];

  //   this.selectedUsers.forEach((u) => {
  //     mentionsList.push(u.email);
  //   });

  //   return mentionsList;
  // }
}
