import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryImputComponent } from './primary-imput.component';

describe('PrimaryImputComponent', () => {
  let component: PrimaryImputComponent;
  let fixture: ComponentFixture<PrimaryImputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimaryImputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimaryImputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
