import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditSubtasksComponent } from './audit-subtasks.component';

describe('AuditComponent', () => {
  let component: AuditSubtasksComponent;
  let fixture: ComponentFixture<AuditSubtasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuditSubtasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditSubtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
