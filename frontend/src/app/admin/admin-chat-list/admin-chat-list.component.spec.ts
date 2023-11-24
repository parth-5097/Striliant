import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminChatListComponent } from './admin-chat-list.component';

describe('AdminChatListComponent', () => {
  let component: AdminChatListComponent;
  let fixture: ComponentFixture<AdminChatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminChatListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
