import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffJournalNoteComponent } from './staff-journal-note.component';

describe('StaffJournalNoteComponent', () => {
  let component: StaffJournalNoteComponent;
  let fixture: ComponentFixture<StaffJournalNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffJournalNoteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffJournalNoteComponent);
    component = fixture.componentInstance;
    component.note = {
      uuid: '',
      body: '',
      author: '',
      edited: false,
      createdAt: 1,
      isEditable: true,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
