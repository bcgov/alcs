import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRequestDialogComponent } from './info-request-dialog.component';

describe('InfoRequestDialogComponent', () => {
  let component: InfoRequestDialogComponent;
  let fixture: ComponentFixture<InfoRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoRequestDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
