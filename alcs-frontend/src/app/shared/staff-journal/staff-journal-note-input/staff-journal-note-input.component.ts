import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  StaffJournalDto,
  UpdateStaffJournalDto,
} from '../../../services/application/application-staff-journal/staff-journal.dto';

@Component({
  selector: 'app-staff-journal-note-input',
  templateUrl: './staff-journal-note-input.component.html',
  styleUrls: ['./staff-journal-note-input.component.scss'],
})
export class StaffJournalNoteInputComponent implements OnInit {
  @Input() isNewNote = false;
  @Input() labelText = '';
  @Input() note: StaffJournalDto = {
    body: '',
    uuid: '',
    author: '',
    edited: false,
    createdAt: 0,
    isEditable: false,
  };

  @Output() save = new EventEmitter<UpdateStaffJournalDto>();
  @Output() create = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  @ViewChild('textarea') private textAreaDiv!: ElementRef;

  isSaving = false;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.textAreaDiv.nativeElement.focus();
    });
  }

  onSave() {
    this.isSaving = true;

    if (this.isNewNote) {
      this.create.emit(this.note.body);
    } else {
      this.save.emit({
        uuid: this.note.uuid,
        body: this.note.body,
      });
    }

    this.clear();
  }

  private clear() {
    this.isSaving = false;

    if (this.isNewNote) {
      this.note.body = '';
    }
  }

  onCancel() {
    this.clear();
    this.cancel.emit();
  }
}
