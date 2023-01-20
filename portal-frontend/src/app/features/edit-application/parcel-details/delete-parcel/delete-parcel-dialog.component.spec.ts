import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteParcelDialogComponent } from './delete-parcel-dialog.component';

describe('DeleteParcelDialogComponent', () => {
  let component: DeleteParcelDialogComponent;
  let fixture: ComponentFixture<DeleteParcelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteParcelDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteParcelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
