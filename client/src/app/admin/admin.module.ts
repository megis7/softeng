import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products/products.component';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ShopsComponent } from './shops/shops.component';
import { EditShopComponent } from './edit-shop/edit-shop.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: 'products', component: ProductsComponent},
  { path: 'edit-product/:id', component: EditProductComponent},
  { path: 'create-product', component: EditProductComponent},
  { path: 'shops', component: ShopsComponent},
  { path: 'edit-shop/:id', component: EditShopComponent},
  { path: 'create-shop', component: EditShopComponent}
];

@NgModule({
  declarations: [ProductsComponent, EditProductComponent, ShopsComponent, EditShopComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AdminModule { }
