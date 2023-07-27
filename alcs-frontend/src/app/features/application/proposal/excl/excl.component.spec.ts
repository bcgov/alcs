import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExclProposalComponent } from './excl.component';

describe('ExclProposalComponent', () => {
  let component: ExclComponent;
  let fixture: ComponentFixture<ExclProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExclProposalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExclProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
