import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog.component';

describe('ChangeApplicationTypeDialogComponent', () => {
  let component: ChangeApplicationTypeDialogComponent;
  let fixture: ComponentFixture<ChangeApplicationTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeApplicationTypeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeApplicationTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
