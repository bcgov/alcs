import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileOverlaySpinnerComponent } from './file-overlay-spinner.component';

describe('FileOverlaySpinnerComponent', () => {
  let component: FileOverlaySpinnerComponent;
  let fixture: ComponentFixture<FileOverlaySpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileOverlaySpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileOverlaySpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
