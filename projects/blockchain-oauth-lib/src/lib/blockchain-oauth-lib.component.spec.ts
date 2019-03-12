import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainOauthLibComponent } from './blockchain-oauth-lib.component';

describe('BlockchainOauthLibComponent', () => {
  let component: BlockchainOauthLibComponent;
  let fixture: ComponentFixture<BlockchainOauthLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockchainOauthLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainOauthLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
