import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCodeDto } from '../../shared/dto/base.dto';
import { BoardDto } from '../board/board.dto';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AdminBoardManagementService {
  private url = `${environment.apiUrl}/board-management`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  async getCardTypes() {
    try {
      return await firstValueFrom(this.http.get<BaseCodeDto[]>(`${this.url}/card-types`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch card types');
      console.log(e);
    }
    return;
  }

  async getCardCounts(boardCode: string) {
    try {
      return await firstValueFrom(this.http.get<Record<string, number>>(`${this.url}/card-counts/${boardCode}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch card types');
      console.log(e);
    }
    return;
  }

  async create(dto: BoardDto) {
    try {
      return await firstValueFrom(this.http.post<void>(`${this.url}`, dto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to create board');
      console.log(e);
    }
    return;
  }

  async update(uuid: string, dto: BoardDto) {
    try {
      return await firstValueFrom(this.http.put<void>(`${this.url}/${uuid}`, dto));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update board');
      console.log(e);
    }
    return;
  }

  async canDelete(code: string) {
    try {
      return await firstValueFrom(this.http.get<{ canDelete: boolean; reason: string }>(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to fetch delete status');
      console.log(e);
    }
    return;
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete(`${this.url}/${code}`));
    } catch (e) {
      this.toastService.showErrorToast('Failed to delete board');
      console.log(e);
    }
    return;
  }
}
