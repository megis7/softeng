import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as ol from 'openlayers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'client';

	map: ol.Map;
	vectorLayer: ol.layer.Vector;
	vectorSource: ol.source.Vector;

	ngOnInit() {
		this.vectorSource = new ol.source.Vector();
		this.vectorLayer = new ol.layer.Vector({
			source: this.vectorSource
		})

		this.map = new ol.Map({
			
		})
	}
	  
}
