import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';
import { CommentService } from '../../services/comment/comment.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CommentsComponent implements OnInit {
  @Input() fileNumber: string = '';

  comments: CommentDto[] = [];
  isEditing = false;
  isSaving = false;
  newComment = '';
  users: Array<any> = [];
  comment: CommentDto = {
    body: '',
    mentions: [],
    uuid: '',
    author: '',
    edited: false,
    createdAt: 0,
    isEditable: false,
  };

  constructor(private commentService: CommentService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadComments(this.fileNumber);

    this.userService.$users.subscribe((users) => {
      this.users = users.map((user) => ({
        mentionName: user.mentionName,
        email: user.email,
      }));
    });
  }

  onEdit() {
    this.isEditing = true;
  }

  private async loadComments(fileNumber: string) {
    this.comments = await this.commentService.fetchComments(fileNumber);
  }

  onCancel() {
    this.isEditing = false;
    this.newComment = '';
  }

  async onSave(comment: CreateCommentDto) {
    this.isSaving = true;

    await this.commentService.createComment(comment);

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
