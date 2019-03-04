import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as annotationsPlugin from 'chartjs-plugin-annotation';

@Component({
	selector: 'app-charts',
	templateUrl: './charts.component.html',
	styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
	
	chartColors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(45, 192, 45)',
		blue: 'rgb(54, 162, 235)',
		darkblue: 'rgb(24, 42, 75)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(231,238,235)',
		darkgrey: 'rgb(81,88,85)',
		black: 'rgb(20,20,20)',
		white: 'rgb(255,255,255)',
	  };

	public barChartOptions = {
		scaleShowVerticalLines: false,
		responsive: true,
		scales: {
			yAxes: [{
				id: 'Oil',
				type: 'linear',
				ticks: {
					min: 50,
					max: 150,
				},
				scaleLabel: {
					display: true,
					labelString: 'Oil',
				},
			}, {
				id: 'Water',
				type: 'linear',
				position: 'right',
				ticks: {
					min: 0,
					max: 30,
				},
				scaleLabel: {
					display: true,
					labelString: 'Water',
				},
			}]
		},
		tooltips: {
			mode: 'index',
			position: 'nearest',
			intersect: false,
		},
		animation: {
			duration: 0,
		},
		hover: {
			intersect: false,
		}
	};

	public barChartLabels: string[] = [];
	public barChartData = [];
	public barChartDataTemp = [];
	public barChartType = 'line';
	public barChartLegend = true;
	public barChartColors;

	@ViewChild(BaseChartDirective) ch: BaseChartDirective;

	dataSeries = [
		{
			index: 0,
			axisId: 'Oil',
			colorName: 'orange',
			label: 'Oil Temp.',
			units: 'fahrenheit',
			activeInBypassMode: true,
		},
		{
			index: 1,
			axisId: 'Water',
			colorName: 'green',
			label: 'Water Temp.',
			units: 'celsius',
			activeInBypassMode: true,
		},
	];

	constructor() { 
		// Chart.pluginService.register(annotationsPlugin);
		this.refreshDataSeries();
	}

	ngOnInit() {
	}

	refreshDataSeries() {
		// This is an ugly hack in ng2-charts, line colors will not work without this:
		this.barChartColors = this.dataSeries.map(r => ({
		  backgroundColor: this.chartColors[r.colorName]
		}));
	
		this.barChartData = this.dataSeries.map(r => ({
		  data: [],
		  label: r.label,
		  yAxisID: r.axisId,
		  pointRadius: 3,
		  pointBorderWidth: 1,
		  pointHoverRadius: 4,
		  pointHoverBorderWidth: 2,
		  pointHitRadius: 1,
		  borderWidth: r.axisId === 'Oil' ? 4 : 1,
		  fill: false,
		  borderColor: this.chartColors[r.colorName], // ...and this...
		}));
	
		this.barChartDataTemp = this.dataSeries.map(r => ({
		  data: [],
		  label: r.label,
		}));
	
		this.barChartLabels = [
		  '10:00',
		  '10:30',
		  '11:00',
		  '11:30',
		  '12:00',
		  '12:30',
		  '13:00',
		  '13:30',
		  '14:00'
		];
	
		this.barChartData[0].data = [
		  50, 65, 68, 89, 92, 99, 108, 122, 130
		];
	
		this.barChartData[1].data = [
		  5, 13, 15.6, 16.2, 18.4, 19.8, 22, 24.4, 26
		];
	  }
}
