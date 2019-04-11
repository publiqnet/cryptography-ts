import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-transaction',
  template: `
    <p>
      transaction works!
    </p>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class TransactionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
