import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchComments(cardUuid: string) {
    return firstValueFrom(this.http.get<CommentDto[]>(`${environment.apiUrl}/comment/${cardUuid}`));
  }

  async createComment(comment: CreateCommentDto) {
    const createdComment = firstValueFrom(
      this.http.post<CommentDto>(`${environment.apiUrl}/comment`, {
        ...comment,
        mentions: [...comment.mentions.values()],
      })
    );
    this.toastService.showSuccessToast('Comment created');
    return createdComment;
  }

  async updateComment(comment: UpdateCommentDto) {
    const updatedComment = firstValueFrom(
      this.http.patch<CommentDto>(`${environment.apiUrl}/comment`, {
        ...comment,
        mentions: [...comment.mentions.values()],
      })
    );
    this.toastService.showSuccessToast('Comment updated');
    return updatedComment;
  }

  async deleteComment(commentId: string) {
    const deleted = firstValueFrom(this.http.delete<CommentDto>(`${environment.apiUrl}/comment/${commentId}`));
    this.toastService.showSuccessToast('Comment deleted');
    return deleted;
  }
}
