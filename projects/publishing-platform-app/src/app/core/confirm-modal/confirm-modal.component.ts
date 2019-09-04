import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: 'confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  @Output() closeConfirmModal = new EventEmitter<boolean>();

  closeModal() {
    this.closeConfirmModal.emit();
  }

}
