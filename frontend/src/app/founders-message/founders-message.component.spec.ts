import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundersMessageComponent } from './founders-message.component';

describe('FoundersMessageComponent', () => {
  let component: FoundersMessageComponent;
  let fixture: ComponentFixture<FoundersMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoundersMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoundersMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
