import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as dayjs from 'dayjs';
import { CommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() comment!: CommentDto;
  @Input() fileNumber!: string;

  @Input()
  mentions: any[] = [];

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<UpdateCommentDto>();
  @Output() mentionsList: Set<string> = new Set();

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
  }

  private getAllMentions(value: string): Set<string> {
    const regex = /(?<=\@)\w+/g;
    return new Set(value.match(regex));
  }

  onCancel() {
    this.isEditing = false;
  }

  onSave(comment: UpdateCommentDto) {
    this.isEditing = false;
    this.edit.emit({
      uuid: comment.uuid,
      body: comment.body,
      mentions: comment.mentions,
    });
  }

  highlightMentions(value: string) {
    const mentions = this.getAllMentions(value);

    for (let mention of mentions) {
      const rgx = new RegExp('@' + mention + '\\b', 'g');

      if (this.mentions.some((u: { mentionLabel: string }) => u.mentionLabel === mention)) {
        value = value.replace(rgx, () => ` <span class="mention green">@${mention}</span> `);
      } else {
        value = value.replace(rgx, () => ` <span class="mention grey">@${mention}</span> `);
      }
    }

    return value;
  }
}
