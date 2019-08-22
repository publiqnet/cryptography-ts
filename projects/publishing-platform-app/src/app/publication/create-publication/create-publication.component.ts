import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-create-publication',
  templateUrl: './create-publication.component.html',
  styleUrls: ['./create-publication.component.scss']
})
export class CreatePublicationComponent implements OnInit {
  @Output() onCloseModal = new EventEmitter<boolean>();
  @Input() modalType: string;

  public invitationData = { 'user': { 'image': 'http://via.placeholder.com/120x120', 'first_name': 'John', 'last_name': 'Doe', 'fullName': 'John Doe' }, 'isFollowing': false, 'followMember': true, 'slug': 'user_data' };


  constructor() {}

  ngOnInit() {}

  closePopup(close: boolean) {
    this.onCloseModal.emit(close);
  }

}
