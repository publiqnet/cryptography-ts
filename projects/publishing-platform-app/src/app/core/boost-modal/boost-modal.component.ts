import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-boost-modal',
  templateUrl: 'boost-modal.component.html',
  styleUrls: ['./boost-modal.component.scss']
})
export class BoostModalComponent implements OnInit {
  @Output() closeBoostedModal = new EventEmitter<any>();
  @Input() modalType: string;
  public boostTab = [];
  public boostPrice: number;
  public boostDays: number;

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

  boostTabChange(e) {
    this.boostDays = e;
  }

  closeBoostModal(e) {
    this.closeBoostedModal.emit(e);
  }
}
