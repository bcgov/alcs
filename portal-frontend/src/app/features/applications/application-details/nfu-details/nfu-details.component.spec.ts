import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfuDetailsComponent } from './nfu-details.component';

describe('NfuDetailsComponent', () => {
  let component: NfuDetailsComponent;
  let fixture: ComponentFixture<NfuDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NfuDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfuDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
