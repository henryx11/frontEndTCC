import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReceitaModalComponent } from './edit-receita-modal.component';

describe('EditReceitaModalComponent', () => {
  let component: EditReceitaModalComponent;
  let fixture: ComponentFixture<EditReceitaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReceitaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditReceitaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
