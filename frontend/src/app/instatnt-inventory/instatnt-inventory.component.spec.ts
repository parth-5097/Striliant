import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstatntInventoryComponent } from './instatnt-inventory.component';

describe('InstatntInventoryComponent', () => {
  let component: InstatntInventoryComponent;
  let fixture: ComponentFixture<InstatntInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstatntInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstatntInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
