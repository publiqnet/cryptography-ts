import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-create-publication',
  templateUrl: './create-publication.component.html',
  styleUrls: ['./create-publication.component.scss']
})
export class CreatePublicationComponent implements OnInit {
  @Output() onCloseModal = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  closePopup(close: boolean) {
    this.onCloseModal.emit(close);
  }

}
