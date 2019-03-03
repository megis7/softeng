import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';
import { Product } from '../../../models/product';
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-edit-product',
	templateUrl: './edit-product.component.html',
	styleUrls: ['./edit-product.component.scss','../../login/login.component.scss']
})
export class EditProductComponent implements OnInit {

	private subscription
	@Input() private activeProduct: Product = null

	productForm = this.fb.group({
		id: [''],
		name: ['', Validators.required],
		description: ['', Validators.required],
		category: ['', Validators.required],
		tags: this.fb.array([this.fb.control('', Validators.required)])
	});

	constructor(private route: ActivatedRoute, private productService: ProductService, private fb: FormBuilder) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			const id = params["id"] || "0"

			if (id == "0")
				this.subscription = (this.activeProduct && of(this.activeProduct)) || of(new Product("0", "", "", "", []))
			else
				this.subscription = this.productService.getProduct(id)

			this.subscription.subscribe(product => {
				this.activeProduct = product;
				this.productForm = this.fb.group({
					id: [this.activeProduct.id],
					name: [this.activeProduct.name],
					description: [this.activeProduct.description],
					category: [this.activeProduct.category],
					tags: this.fb.array([])
				});
				if (id == "0") (this.productForm.get("tags") as FormArray).push(this.fb.control('', Validators.required))
				this.activeProduct.tags.forEach(tag => {
					(this.productForm.get("tags") as FormArray).push(this.fb.control(tag, Validators.required))
				});
			})
		})
	}

	removeTag(i: number) {
		(this.productForm.get("tags") as FormArray).removeAt(i)
		return false
	}

	addTag() {
		(this.productForm.get("tags") as FormArray).push(this.fb.control('', Validators.required))
		return false
	}

	get name() {
		return this.productForm.get('name');
	}

	get description() {
		return this.productForm.get('description');
	}

	get category() {
		return this.productForm.get('category');
	}

	get tags() {
		return this.productForm.get('tags') as FormArray;
	}

	onSubmit() {
		const product = this.productForm.value
		console.log(product)
		if (product.id == "0")
			this.productService.postProduct(product).subscribe(prod => { this.activeProduct = prod; this.productForm.setValue(this.activeProduct) }, err => console.log(err))
		else
			this.productService.putProduct(product).subscribe(prod => { this.activeProduct = prod; this.productForm.setValue(this.activeProduct) }, err => console.log(err))
	}

}
