import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../../../environments/environment';
import {
  ApplicationStaffJournalDto,
  UpdateApplicationStaffJournalDto,
} from '../../../../services/application/application-staff-journal/application-staff-journal.dto';

@Component({
  selector: 'app-staff-journal-note',
  templateUrl: './staff-journal-note.component.html',
  styleUrls: ['./staff-journal-note.component.scss'],
})
export class StaffJournalNoteComponent implements OnInit {
  @Input() note!: ApplicationStaffJournalDto;

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<UpdateApplicationStaffJournalDto>();

  noteDate = '';
  editNote = '';
  isEditing = false;

  constructor() {}

  ngOnInit(): void {
    this.noteDate = moment(this.note.createdAt).format(environment.shortTimeFormat);
  }

  onDelete() {
    this.delete.emit(this.note.uuid);
  }

  onEdit() {
    this.isEditing = true;
    this.editNote = this.note.body;
  }

  onCancel() {
    this.isEditing = false;
  }

  onSave(note: UpdateApplicationStaffJournalDto) {
    this.isEditing = false;
    this.edit.emit({
      uuid: note.uuid,
      body: note.body,
    });
  }
}
