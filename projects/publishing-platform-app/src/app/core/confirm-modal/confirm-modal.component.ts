import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: 'confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  @Output() closeConfirmModal = new EventEmitter<any>();
  @Input('properties') properties: any;

  closeModal(answer: boolean) {
    answer ? this.closeConfirmModal.emit({answer, properties: this.properties}) : this.closeConfirmModal.emit({answer});
  }

}
