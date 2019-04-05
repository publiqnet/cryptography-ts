import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
import { SharedModule } from '../shared/shared.module';
import { BrainKeyComponent } from './brain-key/brain-key.component';
import { RecoverPhraseComponent } from './recover-phrase/recover-phrase.component';
import { MatStepperModule } from '@angular/material/stepper';
import { NewPasswordComponent } from './new-password/new-password.component';
import { RegistrationPasswordComponent } from './registration-password/registration-password.component';
import { LoginPasswordComponent } from './login-password/login-password.component';
import { RegisterConfirmationComponent } from './register-confirmation/register-confirmation.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MatStepperModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    RecoverComponent,
    RegistrationPasswordComponent,
    BrainKeyComponent,
    RecoverPhraseComponent,
    NewPasswordComponent,
    LoginPasswordComponent,
    RegisterConfirmationComponent
  ]
})
export class UserModule {
}
