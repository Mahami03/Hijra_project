<script>
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
    import BarChart from '../../components/BarChart.svelte';
  
    let openTroubles = 0;
    let solvedTroubles = 0;
    let services = 0;
    let recentTroubles = [];
    let allServices = [];
    let oldestUnresolvedTrouble = null;
    let totalDowntime = 0;
  
    onMount(async () => {
      const troublesQuery = query(collection(db, 'sorunlar'));
      const troublesSnapshot = await getDocs(troublesQuery);
      let openCount = 0;
      let solvedCount = 0;
  
      troublesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isCompleted === false) {
          openCount++;
          totalDowntime += data.downtime || 0;
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
    });
  </script>
  
{#if oldestUnresolvedTrouble}
<div class="bg-yellow-200 text-black p-4 rounded-lg shadow-md mb-6 flex items-center border-teal-400 overflow-hidden">
  <i class="fas fa-exclamation-triangle mr-3"></i>
  <div class="flex flex-col">
    <span class="text-black">
      The trouble with service ID 
      <a href={`/troubles`} class="font-bold underline">{oldestUnresolvedTrouble.hizmetId}</a> 
      was opened on
      <span class="font-bold">{new Date(oldestUnresolvedTrouble.bildirimZamani).toLocaleDateString()}</span> by
      <span class="font-bold">{oldestUnresolvedTrouble.sorunuBildiren}</span> and is still unresolved.
    </span>
  </div>
</div>
{/if}

    
  <div class="grid grid-cols-3 gap-6 xl:grid-cols-1">
    <div class="report-card">
      <div class="card">
        <div class="card-body flex flex-col">
          <div class="flex flex-row justify-between items-center">
            <div class="h6 text-indigo-700 fad fa-exclamation-circle "></div>
          </div>
          <div class="mt-8">
            <h1 class="h5 num-4">{openTroubles}</h1>
            <p>Open Troubles</p>
          </div>
        </div>
      </div>
      <div class="footer bg-white p-1 mx-4 border border-t-0 rounded rounded-t-none"></div>
    </div>
    <div class="report-card">
      <div class="card">
        <div class="card-body flex flex-col">
          <div class="flex flex-row justify-between items-center">
            <div class="h6 text-green-700 fad fa-check-circle"></div>
          </div>
          <div class="mt-8">
            <h1 class="h5 num-4">{solvedTroubles}</h1>
            <p>Solved Troubles</p>
          </div>
        </div>
      </div>
      <div class="footer bg-white p-1 mx-4 border border-t-0 rounded rounded-t-none"></div>
    </div>
    <div class="report-card">
      <div class="card">
        <div class="card-body flex flex-col">
          <div class="flex flex-row justify-between items-center">
            <div class="h6 text-yellow-600 fad fa-sitemap"></div>
          </div>
          <div class="mt-8">
            <h1 class="h5 num-4">{services}</h1>
            <p>Services</p>
          </div>
        </div>
      </div>
      <div class="footer bg-white p-1 mx-4 border border-t-0 rounded rounded-t-none"></div>
    </div>
  </div>
  
  <BarChart />
  
  <div class="grid grid-cols-3 gap-6 mt-6 xl:grid-cols-1">
    <div class="card">
      <div class="card-header">Services</div>
      <div class="p-6 flex flex-col">
        {#each allServices as service}
          <div class="flex items-center justify-between border-b py-2">
            <div class="flex items-center">
              <i class="fad fa-cogs mr-4"></i>
              <h1 class="text-lg">{service.hizmetTürü}</h1>
            </div>
            <div>
              <h1 class="text-lg">{service.hizmetId}</h1>
            </div>
          </div>
        {/each}
      </div>
    </div>
  
    <div class="card col-span-2 xl:col-span-1">
      <div class="card-header">Recent Troubles</div>
      <table class="table-auto w-full text-left">
        <thead>
          <tr>
            <th class="px-4 py-2 border-r">Status</th>
            <th class="px-4 py-2 border-r">Service ID</th>
            <th class="px-4 py-2 border-r">Service Type</th>
            <th class="px-4 py-2">TT Number</th>
          </tr>
        </thead>
        <tbody class="text-gray-600">
            {#each recentTroubles as sorun}
              <tr class="border-b">
                <td class="border border-l-0 px-4 py-2 text-center {sorun.isCompleted ? 'text-green-500' : 'text-red-500'}">
                  <i class="fad fa-circle"></i>
                </td>
                <td class="border border-l-0 px-4 py-2">{sorun.hizmetId}</td>
                <td class="border border-l-0 px-4 py-2">{sorun.hizmetTürü}</td>
                <td class="border border-l-0 border-r-0 px-4 py-2">{sorun.ttNumber}</td>
              </tr>
            {/each}
          </tbody>
          
      </table>
    </div>
  </div>

