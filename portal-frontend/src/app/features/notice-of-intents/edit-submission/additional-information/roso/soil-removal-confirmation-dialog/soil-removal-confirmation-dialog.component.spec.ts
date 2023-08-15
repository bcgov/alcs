import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoilRemovalConfirmationDialogComponent } from './soil-removal-confirmation-dialog.component';

describe('SoilRemovalConfirmationDialogComponent', () => {
  let component: SoilRemovalConfirmationDialogComponent;
  let fixture: ComponentFixture<SoilRemovalConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoilRemovalConfirmationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoilRemovalConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
