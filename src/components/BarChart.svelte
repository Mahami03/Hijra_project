<script>
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
    import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
  
    let openTroubles = 0;
    let solvedTroubles = 0;
    let services = 0;
    let recentTroubles = [];
    let allServices = [];
    let oldestUnresolvedTrouble = null;
    let totalDowntime = 0;
    let previousMonthDowntime = 0;
    let percentageChange = 0;
    let chartCanvas;
    let chartLabels = [];
    let chartData = [];
  
    onMount(async () => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
      await fetchData();
      await fetchChartData();
      renderChart();
    });
  
    async function fetchData() {
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const previousMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const previousMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
  
      const troublesQuery = query(collection(db, 'sorunlar'));
      const troublesSnapshot = await getDocs(troublesQuery);
  
      let openCount = 0;
      let solvedCount = 0;
  
      troublesSnapshot.forEach(doc => {
        const data = doc.data();
        const downtime = calculateDowntime(data);
        
        if (data.isCompleted) {
          if (new Date(data.bildirimZamani) >= currentMonthStart) {
            totalDowntime += downtime;
          } else if (new Date(data.bildirimZamani) >= previousMonthStart && new Date(data.bildirimZamani) <= previousMonthEnd) {
            previousMonthDowntime += downtime;
          }
        }
  
        if (data.isCompleted === false) {
          openCount++;
          if (!oldestUnresolvedTrouble || new Date(data.bildirimZamani) < new Date(oldestUnresolvedTrouble.bildirimZamani)) {
            oldestUnresolvedTrouble = { id: doc.id, ...data };
          }
        } else if (data.isCompleted === true) {
          solvedCount++;
        }
      });
  
      openTroubles = openCount;
      solvedTroubles = solvedCount;
  
      const servicesQuery = query(collection(db, 'hizmetler'));
      const servicesSnapshot = await getDocs(servicesQuery);
      services = servicesSnapshot.size;
  
      const recentTroublesQuery = query(collection(db, 'sorunlar'), orderBy('bildirimZamani', 'desc'), limit(services));
      const recentTroublesSnapshot = await getDocs(recentTroublesQuery);
      recentTroubles = recentTroublesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      allServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      if (previousMonthDowntime > 0) {
        percentageChange = ((totalDowntime - previousMonthDowntime) / previousMonthDowntime) * 100;
      }
    }
  
    function calculateDowntime(data) {
      if (!data.isCompleted || !data.çözümZamani) return 0;
      const kesintiMs = Math.abs(new Date(data.çözümZamani) - new Date(data.bildirimZamani));
      const kesintiSaat = Math.floor(kesintiMs / 3600000);
      const kesintiGun = Math.floor(kesintiSaat / 24);
      const kalanSaat = kesintiSaat % 24;
      return kalanSaat + (kesintiGun * 24);
    }
  
    async function fetchChartData() {
      const hizmetlerSnapshot = await getDocs(collection(db, "hizmetler"));
      const sorunlarSnapshot = await getDocs(collection(db, "sorunlar"));
  
      const hizmetToplamlari = {};
  
      sorunlarSnapshot.forEach((sorunDoc) => {
        const { hizmetId, bildirimZamani, çözümZamani, isCompleted } = sorunDoc.data();
  
        if (!isCompleted || !çözümZamani) return;
  
        const kesintiSaat = calculateDowntime({ bildirimZamani, çözümZamani, isCompleted });
        if (!hizmetToplamlari[hizmetId]) {
          hizmetToplamlari[hizmetId] = { saat: 0 };
        }
  
        hizmetToplamlari[hizmetId].saat += kesintiSaat;
      });
  
      chartLabels = Object.keys(hizmetToplamlari);
      chartData = chartLabels.map(hizmetId => hizmetToplamlari[hizmetId].saat);
    }
  
    function renderChart() {
      new Chart(chartCanvas, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Downtime (hours)',
              data: chartData,
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              borderRadius: 10,
              barThickness: 70,
              minBarLength: 5,
            }
          ]
        },
        options: {
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                label: (context) => ` ${context.raw} hours`
              }
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              display: false,
              beginAtZero: true,
            },
            x: {
              display: false,
            }
          },
          layout: {
            padding: 0
          },
          elements: {
            bar: {
              borderSkipped: false,
            }
          }
        }
      });
    }
  </script>
  
  
  <div class="card mt-6">
    <div class="card-header flex flex-row justify-between">
      <h1 class="h6">Overview</h1>
    </div>
    <div class="card-body grid grid-cols-2 gap-6 lg:grid-cols-1">
      <div class="p-8">
        <h1 class="h2">{totalDowntime} hours</h1>
        <p class="text-black font-medium">Total Downtime this month</p>
  
        <div class="mt-16 mb-2 flex items-center">
          <div class="py-1 px-3 rounded {percentageChange >= 0 ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'} mr-3">
            <i class={`fa fa-caret-${percentageChange >= 0 ? 'down' : 'up'}`}></i>
          </div>
          <p class="text-black">
            <span class="num-2 {percentageChange >= 0 ? 'text-red-400' : 'text-green-400'}">{percentageChange.toFixed(2)}%</span>
            <span class={percentageChange >= 0 ? 'text-red-400' : 'text-green-400'}> change in downtime</span> compared to last month.
          </p>
        </div>
  
        <a href="/troubles" class="btn-shadow mt-6">view details</a>
      </div>
  
      <div class="">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </div>
  </div>
  
  
  <style>
    canvas {
      max-width: 100%;
      height: auto;
    }
  </style>
  