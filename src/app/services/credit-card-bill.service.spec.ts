import { TestBed } from '@angular/core/testing';

import { CreditCardBillService } from './credit-card-bill.service';

describe('CreditCardBillService', () => {
  let service: CreditCardBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditCardBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
