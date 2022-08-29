import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SettingsService } from '../settings/settings.service';
import { ToastService } from '../toast/toast.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable({
  providedIn: 'root',
})
export class CommentService implements OnInit {
  constructor(private http: HttpClient, private toastService: ToastService, private settingsService: SettingsService) {}

  ngOnInit(): void {}

  async fetchComments(fileNumber: string) {
    return firstValueFrom(this.http.get<CommentDto[]>(`${this.settingsService.settings.apiUrl}/comment/${fileNumber}`));
  }

  async createComment(comment: CreateCommentDto) {
    const createdComment = firstValueFrom(
      this.http.post<CommentDto>(`${this.settingsService.settings.apiUrl}/comment`, {
        ...comment,
        mentions: [...comment.mentions.values()],
      })
    );
    this.toastService.showSuccessToast('Comment created');
    return createdComment;
  }

  async updateComment(comment: UpdateCommentDto) {
    const updatedComment = firstValueFrom(
      this.http.patch<CommentDto>(`${this.settingsService.settings.apiUrl}/comment`, {
        ...comment,
        mentions: [...comment.mentions.values()],
      })
    );
    this.toastService.showSuccessToast('Comment updated');
    return updatedComment;
  }

  async deleteComment(commentId: string) {
    const deleted = firstValueFrom(this.http.delete<CommentDto>(`${this.settingsService.settings.apiUrl}/comment/${commentId}`));
    this.toastService.showSuccessToast('Comment deleted');
    return deleted;
  }
}
