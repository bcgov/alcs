import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfupComponent } from './nfup.component';

describe('NfupComponent', () => {
  let component: NfupComponent;
  let fixture: ComponentFixture<NfupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
