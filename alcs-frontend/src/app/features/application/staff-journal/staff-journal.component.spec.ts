import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffJournalComponent } from './staff-journal.component';

describe('StaffJournalComponent', () => {
  let component: StaffJournalComponent;
  let fixture: ComponentFixture<StaffJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffJournalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
