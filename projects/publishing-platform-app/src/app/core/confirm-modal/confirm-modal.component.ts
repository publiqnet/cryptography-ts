import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: 'confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
  @Output() closeConfirmModal = new EventEmitter<any>();
  @Input('properties') properties: any;

   title: string;

  closeModal(answer: boolean) {
    answer ? this.closeConfirmModal.emit({answer, properties: this.properties}) : this.closeConfirmModal.emit({answer});
  }

  ngOnInit(): void {
    this.title = this.properties.title ? this.properties.title : 'Are you sure you want to proceed?';
  }

}
