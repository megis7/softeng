import { Component, OnInit } from '@angular/core';
import { Shop } from '../../../models/shop';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit {

  shops: Shop[]
  start: number

  constructor(private shopService: ShopService) { }

  ngOnInit() {
    this.shopService.getShops().subscribe(res => this.shops = res,err => console.log(err));
  }

  deleteProduct(shop: Shop){
    this.shops.splice(this.shops.indexOf(shop),1)
    this.shopService.deleteShop(shop.id).subscribe(msg => {
      //if(msg.message == "OK")this.productService.getProducts().subscribe(res => this.products = res,err => console.log(err))
      console.log(msg.message)
    },err => console.log(err));
  }
}
