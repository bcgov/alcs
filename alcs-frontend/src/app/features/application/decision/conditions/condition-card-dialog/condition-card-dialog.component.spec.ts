import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionCardDialogComponent } from './condition-card-dialog.component';

describe('ConditionCardDialogComponent', () => {
  let component: ConditionCardDialogComponent;
  let fixture: ComponentFixture<ConditionCardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionCardDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConditionCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
