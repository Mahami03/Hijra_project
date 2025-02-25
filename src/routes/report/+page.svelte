<script>
  import { db, auth } from '../../lib/firebase';
  import { collection, getDocs } from 'firebase/firestore';
  import { onAuthStateChanged } from "firebase/auth";
  import Table from '../../components/Table.svelte';
  import BarChart from '../../components/BarChart.svelte';

  let user = null;
  let raporlar = [];
  let hizmetler = [];
  let branches = [];
  let hizmetToplamlari = {};
  let genelToplam = { gun: 0, saat: 0, dakika: 0, saniye: 0 };
  
  let searchTerm = '';
  let currentPage = 1;
  let itemsPerPage = 5;
  let startDate = '';
  let endDate = '';

  onAuthStateChanged(auth, async (currentUser) => {
    user = currentUser;
    if (user) {
      await loadHizmetler();
      await loadBranches();
      await generateReports();
    }
  });
  

  async function loadHizmetler() {
    const hizmetlerSnapshot = await getDocs(collection(db, "hizmetler"));
    hizmetler = hizmetlerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function loadBranches() {
    const branchesSnapshot = await getDocs(collection(db, "branches"));
    branches = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function generateReports() {
    const sorunlarSnapshot = await getDocs(collection(db, "sorunlar"));
    raporlar = [];
    hizmetToplamlari = {};
    genelToplam = { gun: 0, saat: 0, dakika: 0, saniye: 0 };

    sorunlarSnapshot.forEach((sorunDoc) => {
      const sorunData = sorunDoc.data();
      const { hizmetId, branchId, bildirimZamani, çözümZamani, isCompleted, sorunuBildiren } = sorunData;

      if (!isCompleted || !çözümZamani) return;

      const hizmet = hizmetler.find(h => h.hizmetId === hizmetId);
      const branch = branches.find(b => b.id === branchId);

      const bildirimZamaniDate = new Date(bildirimZamani);
      const çözümZamaniDate = new Date(çözümZamani);
      const kesintiMs = Math.abs(çözümZamaniDate - bildirimZamaniDate);

      const kesintiSaniye = Math.floor(kesintiMs / 1000) % 60;
      const kesintiDakika = Math.floor(kesintiMs / 60000) % 60;
      const kesintiSaat = Math.floor(kesintiMs / 3600000);
      const kesintiGun = Math.floor(kesintiSaat / 24);
      const kalanSaat = kesintiSaat % 24;

      if (!hizmetToplamlari[hizmetId]) {
        hizmetToplamlari[hizmetId] = { gun: 0, saat: 0, dakika: 0, saniye: 0 };
      }

      hizmetToplamlari[hizmetId].saniye += kesintiSaniye;
      hizmetToplamlari[hizmetId].dakika += kesintiDakika + Math.floor(hizmetToplamlari[hizmetId].saniye / 60);
      hizmetToplamlari[hizmetId].saat += kalanSaat + Math.floor(hizmetToplamlari[hizmetId].dakika / 60);
      hizmetToplamlari[hizmetId].gun += kesintiGun + Math.floor(hizmetToplamlari[hizmetId].saat / 24);

      hizmetToplamlari[hizmetId].saniye %= 60;
      hizmetToplamlari[hizmetId].dakika %= 60;
      hizmetToplamlari[hizmetId].saat %= 24;

      genelToplam.saniye += kesintiSaniye;
      genelToplam.dakika += kesintiDakika + Math.floor(genelToplam.saniye / 60);
      genelToplam.saat += kalanSaat + Math.floor(genelToplam.dakika / 60);
      genelToplam.gun += kesintiGun + Math.floor(genelToplam.saat / 24);

      genelToplam.saniye %= 60;
      genelToplam.dakika %= 60;
      genelToplam.saat %= 24;

      raporlar.push({
        hizmetId,
        hizmetTürü: hizmet?.hizmetTürü || 'Unknown',
        branchName: branch?.branchName || 'Unknown',
        sorunuBildiren,
        bildirimZamani,
        çözümZamani,
        toplamKesinti: `${kesintiGun} day ${kalanSaat} hour ${kesintiDakika} minute ${kesintiSaniye} second`
      });
    });
  }

  const headers = [
    { key: 'hizmetId', label: 'Service ID' },
    { key: 'hizmetTürü', label: 'Service Type' },
    { key: 'branchName', label: 'Branch Name' },
    { key: 'sorunuBildiren', label: 'Reported By' },
    { key: 'bildirimZamani', label: 'Reported Time' },
    { key: 'çözümZamani', label: 'Resolved Time' },
    { key: 'toplamKesinti', label: 'Total Downtime' }
  ];
</script>

<div class="container mx-auto p-6">
  <h1 class="text-4xl font-bold mb-8 text-gray-800">Reports</h1>

  <Table
    headers={headers}
    data={raporlar}
    searchTerm={searchTerm}
    itemsPerPage={itemsPerPage}
    currentPage={currentPage}
    startDate={startDate}
    endDate={endDate}
  />

  <div class="grid grid-cols-4 gap-6 xl:grid-cols-2 mt-8">
    <div class="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4">
      <div class="flex-shrink-0 bg-indigo-600 text-white rounded-full p-3">
        <i class="fas fa-table"></i>
      </div>
      <div class="flex-1">
        <h2 class="text-lg font-semibold text-gray-800">Total</h2>
        <p class="text-sm text-gray-600">{genelToplam.gun} day {genelToplam.saat} hours</p>
      </div>
    </div>
  
    {#each Object.entries(hizmetToplamlari) as [hizmetId, toplam]}
      <div class="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4">
        <div class="flex-shrink-0 bg-green-600 text-white rounded-full p-3">
          <i class="fad fa-cogs fa-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-800">{hizmetId}</h2>
          <p class="text-sm text-gray-600">{toplam.gun} day {toplam.saat} hours</p>
        </div>
      </div>
    {/each}
  </div>
  <div class="mt-8">
    <h2 class="text-2xl font-semibold mb-4">Service Downtime Chart</h2>
    <BarChart />
  </div>
</div>