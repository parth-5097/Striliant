import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeCenterComponent } from './trade-center.component';

describe('TradeCenterComponent', () => {
  let component: TradeCenterComponent;
  let fixture: ComponentFixture<TradeCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeCenterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
