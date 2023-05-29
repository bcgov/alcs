import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  StaffJournalDto,
  UpdateStaffJournalDto,
} from '../../services/application/application-staff-journal/staff-journal.dto';
import { StaffJournalService } from '../../services/application/application-staff-journal/staff-journal.service';
import { ToastService } from '../../services/toast/toast.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-staff-journal',
  templateUrl: './staff-journal.component.html',
  styleUrls: ['./staff-journal.component.scss'],
})
export class StaffJournalComponent implements OnChanges {
  @Input() parentUuid: string = '';
  @Input() parentType: 'Application' | 'NOI' = 'Application';

  labelText = 'Add a journal note';

  notes: StaffJournalDto[] = [];
  isEditing = false;
  isSaving = false;
  newNote = '';
  users: Array<any> = [];
  note: StaffJournalDto = {
    body: '',
    uuid: '',
    author: '',
    edited: false,
    createdAt: 0,
    isEditable: false,
  };

  constructor(
    private staffJournalService: StaffJournalService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadNotes(this.parentUuid);
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

  async onSave(note: string) {
    this.isSaving = true;

    if (this.parentType === 'Application') {
      await this.staffJournalService.createNoteForApplication({
        applicationUuid: this.parentUuid,
        body: note,
      });
    } else {
      await this.staffJournalService.createNoteForNoticeOfIntent({
        noticeOfIntentUuid: this.parentUuid,
        body: note,
      });
    }

    this.isSaving = false;
    await this.loadNotes(this.parentUuid);
    this.isEditing = false;
    this.newNote = '';
  }

  async onEditNote(update: UpdateStaffJournalDto) {
    this.labelText = 'Edit note';

    await this.staffJournalService.updateNote(update);
    await this.loadNotes(this.parentUuid);
  }

  async onDeleteNote(noteUuid: string | any) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to delete the selected journal note?',
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          await this.staffJournalService.deleteNote(noteUuid);
          await this.loadNotes(this.parentUuid);
          this.toastService.showSuccessToast('Journal note deleted');
        }
      });
  }
}
