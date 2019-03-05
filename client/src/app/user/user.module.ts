import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CrouwdsourceComponent } from './crouwdsource/crouwdsource.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NgbTypeaheadModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TestComponent } from './test/test.component';
import { EntityNotFoundComponent } from './entity-not-found/entity-not-found.component'
import { SharedPrivateModule } from '../shared-private/shared-private.module';
import { CreateEntityComponent } from './create-entity/create-entity.component';
import { GUARD_PROVIDERS } from 'src/guards/guards.export';

const routes: Routes = [
	{ path: '', redirectTo: 'crowdsource' },
	{ path: 'crowdsource', component: CrouwdsourceComponent },
];

@NgModule({
	declarations: [
		CrouwdsourceComponent, 
		TestComponent, 
		EntityNotFoundComponent, 
		CreateEntityComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		SharedModule,
		SharedPrivateModule,
		NgbTypeaheadModule,
		NgbModalModule,
		FormsModule,
		ReactiveFormsModule,
	],
	entryComponents: [
		TestComponent,       // This is required for modal
		EntityNotFoundComponent
	]
})
export class UserModule { }
