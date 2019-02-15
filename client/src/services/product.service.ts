import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Product } from 'src/models/product';
import { environment as env } from '../environments/environment';

import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {

    private url = `${env.baseURL}/products`;

    constructor(
        private http: HttpClient
    ){}

    getProducts(start: number, count: number, status: string, sort: string): Observable<Product[]> {
        const params = new HttpParams().set('start', start.toString())
                                       .set('count', count.toString())
                                       .set('status', status)
                                       .set('sort', sort);

        return this.http.get<{start: number, count: number, total: number, products: Product[]}>(this.url, { params: params })
                        .pipe(map(res => res.products));
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.url}/${id}`);
    }

    postProduct(newProduct: Product): Observable<Product> {
        const { id, ...toSend } = newProduct;
        return this.http.post<Product>(this.url, toSend);
    }

    putProduct(product: Product): Observable<Product> {
        const { id, ...toSend } = product;
        return this.http.put<Product>(`${this.url}/${product.id}`, toSend);
    }

    patchProduct(product: Product, field: string) {
        const toSend = JSON.parse(`{"${field}": "${product[field]}"}`);
        return this.http.patch<Product>(`${this.url}/${product.id}`, toSend);
    }

    deleteProduct(id: string): Observable<string> {
        return this.http.delete<string>(`${this.url}/${id}`);
    }
}