import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationDecisionConditionDialogComponent } from './application-decision-condition-dialog.component';

describe('ApplicationConditionDialogComponent', () => {
  let component: ApplicationDecisionConditionDialogComponent;
  let fixture: ComponentFixture<ApplicationDecisionConditionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDecisionConditionDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDecisionConditionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
