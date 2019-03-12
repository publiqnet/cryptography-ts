import { TestBed } from '@angular/core/testing';

import { BlockchainOauthLibService } from './blockchain-oauth-lib.service';

describe('BlockchainOauthLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlockchainOauthLibService = TestBed.get(BlockchainOauthLibService);
    expect(service).toBeTruthy();
  });
});
