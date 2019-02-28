import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products/products.component';
import { Routes, RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: 'products', component: ProductsComponent},
  { path: 'edit-product/:id', component: EditProductComponent},
  { path: 'create-product', component: EditProductComponent}
];

@NgModule({
  declarations: [ProductsComponent, EditProductComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
