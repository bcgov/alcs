import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceBannerConfirmationDialogComponent } from './maintenance-banner-confirmation-dialog.component';

describe('MaintenanceBannerConfirmationDialogComponent', () => {
  let component: MaintenanceBannerConfirmationDialogComponent;
  let fixture: ComponentFixture<MaintenanceBannerConfirmationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MaintenanceBannerConfirmationDialogComponent]
    });
    fixture = TestBed.createComponent(MaintenanceBannerConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
