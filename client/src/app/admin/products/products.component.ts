import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  products: Product[]
  start: number

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res,err => console.log(err));
  }

  deleteProduct(product: Product){
    this.products.splice(this.products.indexOf(product),1)
    this.productService.deleteProduct(product.id).subscribe(msg => {
      //if(msg.message == "OK")this.productService.getProducts().subscribe(res => this.products = res,err => console.log(err))
      console.log(msg.message)
    },err => console.log(err));
  }
}
