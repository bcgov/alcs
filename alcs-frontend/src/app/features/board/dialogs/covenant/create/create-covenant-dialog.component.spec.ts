import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCovenantDialogComponent } from './create-covenant-dialog.component';

describe('CreateCovenantDialogComponent', () => {
  let component: CreateCovenantDialogComponent;
  let fixture: ComponentFixture<CreateCovenantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCovenantDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCovenantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
