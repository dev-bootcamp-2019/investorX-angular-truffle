import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NominationComponent } from './nomination.component';

describe('NominationComponent', () => {
  let component: NominationComponent;
  let fixture: ComponentFixture<NominationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NominationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NominationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
