import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommentDto, UpdateCommentDto } from '../../services/comment/comment.dto';
import { CommentService } from '../../services/comment/comment.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CommentsComponent implements OnInit {
  @Input() fileNumber: string = '';

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  comments: CommentDto[] = [];
  isEditing = false;
  isSaving = false;
  newComment = '';
  selectedUsers: Set<any> = new Set<UserDto>();
  users: Array<any> = [];

  constructor(private commentService: CommentService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadComments(this.fileNumber);

    this.userService.$users.subscribe((users) => {
      this.users = users.map((user) => ({
        mentionName: this.capitalizeFirstLetter(user.givenName) + this.capitalizeFirstLetter(user.familyName),
        email: user.email,
      }));

      console.log('users', this.users);
    });
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

    console.log('Comments on save', this.getMentionsList());
    await this.commentService.createComment({
      fileNumber: this.fileNumber,
      body: this.newComment,
      mentionsList: this.getMentionsList(),
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

  // mentions
  async onMentionUserSelected(selectedUser: any) {
    this.selectedUsers.add(selectedUser);
  }

  private cleanUpSelectedUsers(commentBody: string, selectedUsers: Set<any>) {
    for (let user of selectedUsers) {
      if (commentBody.indexOf(user.mentionName) === -1) {
        selectedUsers.delete(user);
      }
    }
  }

  private capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private getMentionsList() {
    this.cleanUpSelectedUsers(this.newComment, this.selectedUsers);

    const mentionsList: string[] = [];

    this.selectedUsers.forEach((u) => {
      mentionsList.push(u.email);
    });

    return mentionsList;
  }
}
