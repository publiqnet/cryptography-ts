import { NgModule } from '@angular/core';
import { SharedLibComponent } from './shared-lib.component';
import { LettersAnimationComponent } from './components/letters-animation/letters-animation.component';

@NgModule({
  declarations: [
    SharedLibComponent,
    LettersAnimationComponent
  ],
  imports: [
  ],
  exports: [
    SharedLibComponent,
    LettersAnimationComponent
  ]
})
export class SharedLibModule { }
