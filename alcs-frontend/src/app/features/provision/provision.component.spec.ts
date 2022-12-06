import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';

import { ProvisionComponent } from './provision.component';

describe('ProvisionComponent', () => {
  let component: ProvisionComponent;
  let fixture: ComponentFixture<ProvisionComponent>;
  let mockAuthenticationService: DeepMocked<AuthenticationService>;

  beforeEach(async () => {
    mockAuthenticationService = createMock();
    mockAuthenticationService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProvisionComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
