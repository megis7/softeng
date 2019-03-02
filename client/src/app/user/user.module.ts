import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CrouwdsourceComponent } from './crouwdsource/crouwdsource.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap'

const routes: Routes = [
  { path: '', redirectTo: 'crowdsource'},
  { path: 'crowdsource', component: CrouwdsourceComponent }
];

@NgModule({
    declarations: [CrouwdsourceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbTypeaheadModule
  ]
})
export class UserModule { }
