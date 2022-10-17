import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDecisionDialogComponent } from './post-decision-dialog.component';

describe('PostDecisionDialogComponent', () => {
  let component: PostDecisionDialogComponent;
  let fixture: ComponentFixture<PostDecisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostDecisionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDecisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
