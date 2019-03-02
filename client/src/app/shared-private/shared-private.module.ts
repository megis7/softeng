import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditProductComponent } from './edit-product/edit-product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditShopComponent } from './edit-shop/edit-shop.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	declarations: [
		EditProductComponent,
		EditShopComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
	],
	exports: [
		EditProductComponent,
		EditShopComponent
	]
})
export class SharedPrivateModule { }
