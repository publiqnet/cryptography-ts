import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { AccountService } from './core/services/account.service';
import { WalletService } from './core/services/wallet.service';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { environment } from '../environments/environment';
import { UserIdleModule } from './core/models/angular-user-idle/user-idle.module';
import { HttpHelperService, OauthService } from 'helper-lib';

HttpHelperService.setBaseHeaders([
  {
    headerKay: 'X-API-TOKEN',
    getHeaderValue: () => localStorage.getItem('auth')
  }
]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'wallet'}),
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
    AppRoutingModule,
    UserModule,
    WalletModule,
    Angulartics2Module.forRoot([Angulartics2GoogleAnalytics]),
    UserIdleModule.forRoot({idle: environment.auto_logout_time, timeout: 5, ping: 5})
  ],
  providers: [
    WalletService,
    AccountService,
    OauthService,
    {provide: 'oauthUrl', useValue: environment.oauth_backend},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
