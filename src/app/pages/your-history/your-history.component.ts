import { Component, inject, OnInit, ViewChild, ElementRef, effect, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { YourHistoryStore } from './your-history.store';
import { Chart, registerables, TooltipItem } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-your-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './your-history.component.html'
})
export class YourHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('historyChart')
  private historyChartCanvas?: ElementRef<HTMLCanvasElement>;

  protected readonly store = inject(YourHistoryStore);
  
  private chart?: Chart;

  constructor() {
    effect(() => {
      const data = this.store.yearlyKms();
      if (data.length > 0) {
        this.updateChart(data);
      }
    });
  }

  public ngOnInit(): void {
    this.store.loadActivities();
  }

  public ngAfterViewInit(): void {
    // Chart will be initialized when data arrives via effect
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private updateChart(data: { year: number; distance: number }[]): void {
    if (!this.historyChartCanvas) return;

    const ctx = this.historyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.year.toString()),
        datasets: [{
          label: 'Total Kilometers',
          data: data.map(d => d.distance),
          backgroundColor: '#fc4c02', // Strava Orange
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context: TooltipItem<'bar'>) => ` ${context.parsed.y} km`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Inter, sans-serif',
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Inter, sans-serif',
                size: 12
              },
              callback: (value: string | number) => `${value} km`
            }
          }
        }
      }
    });
  }
}
