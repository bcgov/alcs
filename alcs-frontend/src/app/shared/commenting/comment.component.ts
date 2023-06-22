import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../environments/environment';
import { CommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() comment!: CommentDto;
  @Input() fileNumber!: string;
  @Input() notificationTitle!: string;

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
    this.commentDate = moment(this.comment.createdAt).format(environment.longTimeFormat);
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
      notificationTitle: this.notificationTitle,
    });
  }

  highlightMentions(value: string) {
    const mentions = this.getAllMentions(value);

    for (let mention of mentions) {
      const rgx = new RegExp('@' + mention + '\\b', 'g');

      if (this.mentions.some((u: { mentionLabel: string }) => u.mentionLabel === mention)) {
        value = value.replace(rgx, () => ` <span class="mention green">@${mention}</span> `);
      } else {
        value = value.replace(rgx, () => ` <span class="mention red"><del>@${mention}</del></span> `);
      }
    }

    return value;
  }
}
