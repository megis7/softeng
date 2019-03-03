import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products/products.component';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ShopsComponent } from './shops/shops.component';
import { EditShopComponent } from '../shared-private/edit-shop/edit-shop.component';
import { SharedModule } from '../shared/shared.module';
import { EditProductComponent } from '../shared-private/edit-product/edit-product.component'
import { SharedPrivateModule } from '../shared-private/shared-private.module';
import { EditPriceComponent } from './edit-price/edit-price.component';
import { NgbDatepickerModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { EditShopComponent as AdminEditShop } from './edit-shop/edit-shop.component';

const routes: Routes = [
	{ path: 'products', component: ProductsComponent },
	{ path: 'edit-product/:id', component: EditProductComponent },
	{ path: 'create-product', component: EditProductComponent },
	{ path: 'shops', component: ShopsComponent },
	{ path: 'edit-shop/:id', component: AdminEditShop },
	{ path: 'create-shop', component: AdminEditShop },
	{ path: 'edit-price', component: EditPriceComponent}
];

@NgModule({
	declarations: [
		ProductsComponent,
		EditPriceComponent,
		ShopsComponent,
		AdminEditShop],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		DataTablesModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		SharedPrivateModule,
		NgbDatepickerModule,
		NgbPaginationModule
	]
})
export class AdminModule { }
