import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDespesaModalComponent } from './add-despesa-modal.component';

describe('AddDespesaModalComponent', () => {
  let component: AddDespesaModalComponent;
  let fixture: ComponentFixture<AddDespesaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDespesaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDespesaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
