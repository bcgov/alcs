import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';
import { environment } from '../../../../environments/environment';
import {
  StaffJournalDto,
  UpdateStaffJournalDto,
} from '../../../services/application/application-staff-journal/staff-journal.dto';

@Component({
  selector: 'app-staff-journal-note',
  templateUrl: './staff-journal-note.component.html',
  styleUrls: ['./staff-journal-note.component.scss'],
})
export class StaffJournalNoteComponent implements OnInit {
  @Input() note!: StaffJournalDto;

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<UpdateStaffJournalDto>();

  noteDate = '';
  editNote = '';
  isEditing = false;

  constructor() {}

  ngOnInit(): void {
    this.noteDate = moment(this.note.createdAt).format(environment.longTimeFormat);
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

  onSave(updateDto: UpdateStaffJournalDto) {
    this.isEditing = false;
    this.edit.emit({
      body: updateDto.body,
      uuid: updateDto.uuid,
    });
  }
}
