import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApplicationStaffJournalDto,
  CreateApplicationStaffJournalDto,
  UpdateApplicationStaffJournalDto,
} from '../../../services/application/application-staff-journal/application-staff-journal.dto';
import { ApplicationStaffJournalService } from '../../../services/application/application-staff-journal/application-staff-journal.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
@Component({
  selector: 'app-staff-journal',
  templateUrl: './staff-journal.component.html',
  styleUrls: ['./staff-journal.component.scss'],
})
export class StaffJournalComponent implements OnChanges {
  @Input() applicationUuid: string = '';

  labelText = 'Add a journal note';

  notes: ApplicationStaffJournalDto[] = [];
  isEditing = false;
  isSaving = false;
  newNote = '';
  users: Array<any> = [];
  note: ApplicationStaffJournalDto = {
    body: '',
    uuid: '',
    author: '',
    edited: false,
    createdAt: 0,
    isEditable: false,
  };

  constructor(
    private staffJournalService: ApplicationStaffJournalService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadNotes(this.applicationUuid);
  }

  onEdit() {
    this.isEditing = true;
  }

  private async loadNotes(applicationUuid: string) {
    this.notes = await this.staffJournalService.fetchNotes(applicationUuid);
  }

  onCancel() {
    this.isEditing = false;
    this.newNote = '';
  }

  async onSave(note: CreateApplicationStaffJournalDto) {
    this.isSaving = true;
    note.applicationUuid = this.applicationUuid;

    await this.staffJournalService.createNote(note);

    this.isSaving = false;
    await this.loadNotes(this.applicationUuid);
    this.isEditing = false;
    this.newNote = '';
  }

  async onEditNote(update: UpdateApplicationStaffJournalDto | any) {
    this.labelText = 'Edit note';

    await this.staffJournalService.updateNote(update);
    await this.loadNotes(this.applicationUuid);
  }

  async onDeleteNote(noteUuid: string | any) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected journal note?',
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          await this.staffJournalService.deleteNote(noteUuid);
          await this.loadNotes(this.applicationUuid);
          this.toastService.showSuccessToast('Journal note deleted');
        }
      });
  }
}
