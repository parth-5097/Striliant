import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyRequestsDetailsComponent } from './buy-requests-details.component';

describe('BuyRequestsDetailsComponent', () => {
  let component: BuyRequestsDetailsComponent;
  let fixture: ComponentFixture<BuyRequestsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyRequestsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyRequestsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
