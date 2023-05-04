import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseDialogComponent } from './release-dialog.component';

describe('ReleaseDialogComponent', () => {
  let component: ReleaseDialogComponent;
  let fixture: ComponentFixture<ReleaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
