import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceitaModalComponent } from './add-receita-modal.component';

describe('AddReceitaModalComponent', () => {
  let component: AddReceitaModalComponent;
  let fixture: ComponentFixture<AddReceitaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReceitaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReceitaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
