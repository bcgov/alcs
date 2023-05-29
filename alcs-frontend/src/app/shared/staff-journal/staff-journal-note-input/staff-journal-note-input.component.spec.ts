import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffJournalNoteInputComponent } from './staff-journal-note-input.component';

describe('StaffJournalNoteInputComponent', () => {
  let component: StaffJournalNoteInputComponent;
  let fixture: ComponentFixture<StaffJournalNoteInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffJournalNoteInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffJournalNoteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
