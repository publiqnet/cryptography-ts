import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-chips-input',
  templateUrl: './chips-input.component.html',
  styleUrls: ['./chips-input.component.scss']
})
export class ChipsInputComponent implements OnInit {
  @Input() tagsArray = [1, 2, 3, 4, 5, 6, 7, 8];
  @Output() change = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Output() keyupEnter = new EventEmitter();

  textControl: FormControl = new FormControl();
  constructor() { }

  ngOnInit() {
    this.textControl.valueChanges.
      subscribe(
        res => {
          this.change.emit(res);
        }
      );
  }

  enterKeyup() {
    this.keyupEnter.emit();
    this.textControl.setValue('');
  }

  removeChip(index) {
    this.remove.emit(index);
  }

}
