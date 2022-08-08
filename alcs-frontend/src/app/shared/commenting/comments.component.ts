import { Component, ElementRef, Input, OnInit, QueryList, ViewChild } from '@angular/core';
import { CommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';
import { CommentService } from '../../services/comment/comment.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {
  @Input() fileNumber: string = '';

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  comments: CommentDto[] = [];
  isEditing = false;
  isSaving = false;
  newComment = '';

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments(this.fileNumber);
  }

  onEdit() {
    this.isEditing = true;
    setTimeout(() => {
      this.textAreaDiv.nativeElement.focus();
    });
  }

  private async loadComments(fileNumber: string) {
    this.comments = await this.commentService.fetchComments(fileNumber);
  }

  onCancel() {
    this.isEditing = false;
    this.newComment = '';
  }

  async onSave() {
    this.isSaving = true;
    await this.commentService.createComment({
      fileNumber: this.fileNumber,
      body: this.newComment,
    });
    this.isSaving = false;
    await this.loadComments(this.fileNumber);
    this.isEditing = false;
    this.newComment = '';
  }

  async onEditComment(update: UpdateCommentDto) {
    await this.commentService.updateComment(update);
    await this.loadComments(this.fileNumber);
  }

  async onDeleteComment(commentId: string) {
    await this.commentService.deleteComment(commentId);
    await this.loadComments(this.fileNumber);
  }
}
