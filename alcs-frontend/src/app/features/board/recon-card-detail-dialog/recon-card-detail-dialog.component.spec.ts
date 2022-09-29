import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconCardDetailDialogComponent } from './recon-card-detail-dialog.component';

describe('ReconCardDetailDialogComponent', () => {
  let component: ReconCardDetailDialogComponent;
  let fixture: ComponentFixture<ReconCardDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReconCardDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReconCardDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
