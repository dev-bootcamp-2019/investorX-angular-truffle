import { TestBed, inject } from '@angular/core/testing';

import { ElectionFactoryService } from './election-factory.service';

describe('ElectionFactoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectionFactoryService]
    });
  });

  it('should be created', inject([ElectionFactoryService], (service: ElectionFactoryService) => {
    expect(service).toBeTruthy();
  }));
});
