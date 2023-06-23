import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaruProposalComponent } from './naru.component';

describe('NaruComponent', () => {
  let component: NaruProposalComponent;
  let fixture: ComponentFixture<NaruProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NaruProposalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NaruProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
