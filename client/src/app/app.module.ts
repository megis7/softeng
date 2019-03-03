import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { CoffeeComponent } from './coffee/coffee.component';
import { SERVICE_PROVIDERS } from 'src/services/service.export';
import { LogoutComponent } from './logout/logout.component';
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { TokenInterceptor } from 'src/infrastructure/token.interceptor';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { NgbTypeaheadModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { UnauthorizedInterceptor } from 'src/infrastructure/unauthorized.interceptor';
import { ToastNoAnimationModule } from 'ngx-toastr';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		AboutComponent,
		LoginComponent,
		CoffeeComponent,
		LogoutComponent,
		RegisterComponent,
		UnauthorizedComponent,
		NotfoundComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		SharedModule,
		ReactiveFormsModule,
		FormsModule,
		NgbTypeaheadModule,
		NgbCollapseModule,
		ToastNoAnimationModule.forRoot({
			timeOut: 5000,
			positionClass: 'toast-top-center',
			closeButton: true,
			maxOpened: 3,
			autoDismiss: true
		})
	],
	providers: [
		SERVICE_PROVIDERS,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: UnauthorizedInterceptor,
			multi: true
		},
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
