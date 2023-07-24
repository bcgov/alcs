import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InclProposalComponent } from './incl-proposal.component';

describe('InclProposalComponent', () => {
  let component: InclProposalComponent;
  let fixture: ComponentFixture<InclProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InclProposalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InclProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
