import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecureComponent } from './secure';

describe('SecureComponent', () => {
  let component: SecureComponent;
  let fixture: ComponentFixture<SecureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecureComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SecureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
