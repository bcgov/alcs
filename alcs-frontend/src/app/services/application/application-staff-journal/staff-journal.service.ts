import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  StaffJournalDto,
  CreateApplicationStaffJournalDto,
  UpdateStaffJournalDto,
  CreateNoticeOfIntentStaffJournalDto,
} from './staff-journal.dto';

@Injectable({
  providedIn: 'root',
})
export class StaffJournalService {
  baseUrl = `${environment.apiUrl}/application-staff-journal`;
  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchNotes(applicationUuid: string) {
    return firstValueFrom(this.http.get<StaffJournalDto[]>(`${this.baseUrl}/${applicationUuid}`));
  }

  async createNoteForApplication(note: CreateApplicationStaffJournalDto) {
    const createdNote = firstValueFrom(this.http.post<StaffJournalDto>(`${this.baseUrl}/application`, note));
    this.toastService.showSuccessToast('Journal note created');
    return createdNote;
  }

  async createNoteForNoticeOfIntent(note: CreateNoticeOfIntentStaffJournalDto) {
    const createdNote = firstValueFrom(this.http.post<StaffJournalDto>(`${this.baseUrl}/notice-of-intent`, note));
    this.toastService.showSuccessToast('Journal note created');
    return createdNote;
  }

  async updateNote(note: UpdateStaffJournalDto) {
    const updatedNote = firstValueFrom(this.http.patch<StaffJournalDto>(`${this.baseUrl}`, note));
    this.toastService.showSuccessToast('Journal note updated');
    return updatedNote;
  }

  async deleteNote(noteUuid: string) {
    const deleted = firstValueFrom(this.http.delete<StaffJournalDto>(`${this.baseUrl}/${noteUuid}`));
    this.toastService.showSuccessToast('Journal note deleted');
    return deleted;
  }
}
