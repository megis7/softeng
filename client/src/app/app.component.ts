import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as ol from 'openlayers';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

	map: ol.Map;
	vectorLayer: ol.layer.Vector;
	vectorSource: ol.source.Vector;

	private coffeeShopIconPath = "favicon.ico"

	private createIconStyle(src: string, img: any): ol.style.Style {
		const icon = new ol.style.Icon({
			anchor: [0.5, 0.5],
			crossOrigin: 'anonymous',
			src: src,
			img: img,
			imgSize: img ? [img.width, img.height] : undefined
		}) 

		return new ol.style.Style({
			image: icon
		})
	}

	ngOnInit() {
		this.vectorSource = new ol.source.Vector();
		this.vectorLayer = new ol.layer.Vector({
			source: this.vectorSource
		})


		this.map = new ol.Map({
			target: 'map-container',
			layers: [
				new ol.layer.Tile({ source: new ol.source.OSM() }),
				this.vectorLayer
			],
			view: new ol.View({ center: ol.proj.fromLonLat([23, 38]), zoom: 7 })
		})

		// let style = new ol.style.Style(
		// 	{
		// 		image: new ol.style.Circle({
		// 			radius: 7,
		// 			fill: new ol.style.Fill({
		// 				color: 'yellow'
		// 			}),
		// 			stroke: new ol.style.Stroke({
		// 		 		color: 'blue'
		// 		 	})

		// 	 })
		// 	}
		// )

		
		let feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([23, 38])));
		feature.setStyle(this.createIconStyle(this.coffeeShopIconPath, undefined));
		feature.setProperties({name:'test point',value:15});
		
    	this.vectorSource.addFeature(feature);
	}

}
