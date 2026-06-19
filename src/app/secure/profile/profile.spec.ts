import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileComponent } from './profile';
import { AuthService } from '../../services/auth.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, HttpClientTestingModule],
      providers: [AuthService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
