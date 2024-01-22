import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionPurposesPanelComponent } from './commission-purposes-panel.component';

describe('CommissionPurposesPanelComponent', () => {
  let component: CommissionPurposesPanelComponent;
  let fixture: ComponentFixture<CommissionPurposesPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommissionPurposesPanelComponent]
    });
    fixture = TestBed.createComponent(CommissionPurposesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
