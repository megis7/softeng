import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Product } from 'src/models/product';
import { environment as env } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {

    private products =  [
        {"id":"1","name":  "Προϊόν 1", "description":  "Περιγραφή προϊόντος 1", "category":  "Κατηγορία Πρώτη", "tags": ["Υπολογιστές"], "withdrawn": false},
        {"id":"2","name":  "Προϊόν 2", "description":  "Περιγραφή προϊόντος 2", "category":  "Κατηγορία Δεύτερη", "tags": ["Μουσική"], "withdrawn": false},
        {"id":"3","name":  "Προϊόν 3", "description":  "Περιγραφή προϊόντος 3", "category":  "Κατηγορία Πρώτη", "tags": ["Μουσική", "Διασκέδαση"], "withdrawn": false}
      ]

    private url = `${env.baseURL}/products`;

    constructor(
        private http: HttpClient
    ){}

    getProducts(start: number = 0, count: number = 20, status: string = "ACTIVE", sort: string = "id|DESC"): Observable<Product[]> {
        const params = new HttpParams().set('start', start.toString())
                                       .set('count', count.toString())
                                       .set('status', status)
                                       .set('sort', sort);

        return this.http.get<{start: number, count: number, total: number, products: Product[]}>(this.url, { params: params })
                        .pipe(map(res => res.products));
        // return of(this.products.map(x => Object.assign({}, x)));
    }

    getProductsPaged(start: number = 0, count: number = 20, status: string = "ACTIVE", sort: string = "id|DESC"): 
        Observable<{start: number, count: number, total: number, products: Product[]}> {
            return of({start: start, count: count, total: this.products.length, products: this.products.slice(start, start + count).map(x => Object.assign({}, x))});
    }

    getProduct(id: string): Observable<Product> {
        // return this.http.get<Product>(`${this.url}/${id}`);
        return of(this.products.find(x => x.id == id))
    }

    postProduct(newProduct: Product): Observable<Product> {
        const { id, ...toSend } = newProduct;
        return this.http.post<Product>(this.url, toSend);
    }

    putProduct(product: Product): Observable<Product> {
        const { id, ...toSend } = product;
        return this.http.put<Product>(`${this.url}/${product.id}`, toSend);
    }

    patchProduct(product: Product, field: string): Observable<Product> {
        const toSend = JSON.parse(`{"${field}": ${JSON.stringify(product[field])}}`);
        return this.http.patch<Product>(`${this.url}/${product.id}`, toSend);
    }

    deleteProduct(id: string): Observable<{message: string}> {
        //return this.http.delete<{message: string}>(`${this.url}/${id}`);
        this.products.splice(this.products.findIndex(x => x.id == id), 1)
        return of({"message":"OK"})
    }
}