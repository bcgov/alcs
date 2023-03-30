import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  ApplicationStaffJournalDto,
  CreateApplicationStaffJournalDto,
  UpdateApplicationStaffJournalDto,
} from './application-staff-journal.dto';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStaffJournalService {
  baseUrl = `${environment.apiUrl}/application-staff-journal`;
  constructor(private http: HttpClient, private toastService: ToastService) {}

  async fetchNotes(applicationUuid: string) {
    return firstValueFrom(this.http.get<ApplicationStaffJournalDto[]>(`${this.baseUrl}/${applicationUuid}`));
  }

  async createNote(note: CreateApplicationStaffJournalDto) {
    const createdNote = firstValueFrom(this.http.post<ApplicationStaffJournalDto>(this.baseUrl, note));
    this.toastService.showSuccessToast('Journal note created');
    return createdNote;
  }

  async updateNote(note: UpdateApplicationStaffJournalDto) {
    const updatedNote = firstValueFrom(this.http.patch<ApplicationStaffJournalDto>(`${this.baseUrl}`, note));
    this.toastService.showSuccessToast('Journal note updated');
    return updatedNote;
  }

  async deleteNote(noteUuid: string) {
    const deleted = firstValueFrom(this.http.delete<ApplicationStaffJournalDto>(`${this.baseUrl}/${noteUuid}`));
    this.toastService.showSuccessToast('Journal note deleted');
    return deleted;
  }
}
