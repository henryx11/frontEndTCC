import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemCreditcardBillComponent } from './add-item-creditcard-bill.component';

describe('AddItemCreditcardBillComponent', () => {
  let component: AddItemCreditcardBillComponent;
  let fixture: ComponentFixture<AddItemCreditcardBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItemCreditcardBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddItemCreditcardBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
