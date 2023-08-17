import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalComponent } from './proposal.component';

describe('ProposalComponent', () => {
  let component: ProposalComponent;
  let fixture: ComponentFixture<ProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProposalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
