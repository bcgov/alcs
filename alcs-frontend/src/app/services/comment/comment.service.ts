import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable({
  providedIn: 'root',
})
export class CommentService implements OnInit {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {}

  async fetchComments(fileNumber: string) {
    return firstValueFrom(this.http.get<CommentDto[]>(`${environment.apiRoot}/comment/${fileNumber}`));
  }

  async createComment(comment: CreateCommentDto) {
    const createdComment = firstValueFrom(
      this.http.post<CommentDto>(`${environment.apiRoot}/comment`, {
        ...comment,
        mentions: [...comment.mentions.values()],
      })
    );
    this.toastService.showSuccessToast('Comment created');
    return createdComment;
  }

  async updateComment(comment: UpdateCommentDto) {
    const updatedComment = firstValueFrom(
      this.http.patch<CommentDto>(`${environment.apiRoot}/comment`, {
        ...comment,
        mentions: [...comment.mentions.values()],
      })
    );
    this.toastService.showSuccessToast('Comment updated');
    return updatedComment;
  }

  async deleteComment(commentId: string) {
    const deleted = firstValueFrom(this.http.delete<CommentDto>(`${environment.apiRoot}/comment/${commentId}`));
    this.toastService.showSuccessToast('Comment deleted');
    return deleted;
  }
}
