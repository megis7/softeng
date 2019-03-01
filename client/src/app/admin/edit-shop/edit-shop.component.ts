import { Component, OnInit } from '@angular/core';
import { Shop } from '../../../models/shop';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray } from '@angular/forms';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-edit-shop',
  templateUrl: './edit-shop.component.html',
  styleUrls: ['./edit-shop.component.scss']
})
export class EditShopComponent implements OnInit {


  private subscription
  private activeShop: Shop
  shopForm = this.fb.group({
    id: [''],
    name: [''],
    address: [''],
    lat: [''],
    lng: [''],
    tags: this.fb.array([this.fb.control('')])
  });

  constructor(private route: ActivatedRoute, private shopService: ShopService, private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params["id"]||"0"

      if(id == "0")
        this.subscription = of(new Shop("0","","",0,0,[]))
      else
        this.subscription = this.shopService.getShop(id)

      this.subscription.subscribe(shop => {this.activeShop = shop;
        this.shopForm = this.fb.group({
          id: [this.activeShop.id],
          name: [this.activeShop.name],
          address: [this.activeShop.address],
          lat: [this.activeShop.lat],
          lon: [this.activeShop.lng],
          tags: this.fb.array([])
        });
        if(id == "0")(this.shopForm.get("tags") as FormArray).push(this.fb.control(''))
        this.activeShop.tags.forEach(tag => {
          (this.shopForm.get("tags") as FormArray).push(this.fb.control(tag))
        });
      })
    })
  }

  removeTag(i: number){
    (this.shopForm.get("tags") as FormArray).removeAt(i)
    return false
  }

  addTag(){
    (this.shopForm.get("tags") as FormArray).push(this.fb.control(''))
    return false
  }
  get tags() {
    return this.shopForm.get('tags') as FormArray;
  }

  onSubmit(){
    const shop = this.shopForm.value
    console.log(shop)
    if(shop.id == "0")
      this.shopService.postShop(shop).subscribe(sho => {this.activeShop = sho;this.shopForm.setValue(this.activeShop)},err => console.log(err))
    else
      this.shopService.putShop(shop).subscribe(sho => {this.activeShop = sho;this.shopForm.setValue(this.activeShop)},err => console.log(err))
  }

}
