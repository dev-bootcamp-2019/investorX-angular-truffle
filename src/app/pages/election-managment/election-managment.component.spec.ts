import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectionManagmentComponent } from './election-managment.component';

describe('ElectionManagmentComponent', () => {
  let component: ElectionManagmentComponent;
  let fixture: ComponentFixture<ElectionManagmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectionManagmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectionManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
