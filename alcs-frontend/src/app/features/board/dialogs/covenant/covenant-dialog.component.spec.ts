import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CovenantDialogComponent } from './covenant-dialog.component';

describe('CovenantDialogComponent', () => {
  let component: CovenantDialogComponent;
  let fixture: ComponentFixture<CovenantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CovenantDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CovenantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
