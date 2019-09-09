import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-boost-modal',
  templateUrl: 'boost-modal.component.html',
  styleUrls: ['./boost-modal.component.scss']
})
export class BoostModalComponent implements OnInit, OnDestroy {
  @Output() closeBoostedModal = new EventEmitter<any>();
  @Output() cancelBoost = new EventEmitter<any>();
  @Output() newBoost = new EventEmitter<any>();
  @Input() modalType: string;
  public boostTab = [];
  public boostPrice: number;
  public boostDays: number;
  public boostPassword: string = '';

  constructor(
    public accountService: AccountService
  ) {
  }

  ngOnInit() {
    this.initDefaultData();
  }

  initDefaultData() {
    this.boostPrice = 50;
    this.boostDays = 1;

    this.boostTab = [
      {
        'value': '1',
        'text': '1 Day'
      },
      {
        'value': '3',
        'text': '3 Days',
      },
      {
        'value': '7',
        'text': '7 Days',
      }
    ];
  }

  onRangeChange(event) {
    this.boostPrice = event.target.value;
  }

  boostTabChange(e) {
    this.boostDays = e;
  }

  closeBoostModal(e) {
    this.closeBoostedModal.emit(e);
  }

  onInputChange(event) {
    this.boostPassword = event.value;
  }

  cancelBoostSubmit() {
    this.cancelBoost.emit(this.boostPassword);
  }

  addBoostSubmit() {
    this.newBoost.emit({'boostDays': this.boostDays, 'boostPrice': this.boostPrice, 'password': this.boostPassword});
  }

  ngOnDestroy(): void {
    this.boostPassword = '';
  }
}
