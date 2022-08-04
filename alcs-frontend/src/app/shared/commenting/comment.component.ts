import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() comment!: CommentDto;

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<UpdateCommentDto>();

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
    setTimeout(() => {
      this.textAreaDiv.nativeElement.focus();
    });
  }

  onCancel() {
    this.isEditing = false;
  }

  onSave() {
    this.edit.emit({
      uuid: this.comment.uuid,
      body: this.editComment,
    });
  }
}
