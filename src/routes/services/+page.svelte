<script>
  import { onMount } from 'svelte';
  import { db, auth } from '../../lib/firebase';
  import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { onAuthStateChanged } from "firebase/auth";
  import { goto } from '$app/navigation';

  let user = null;
  let hizmetler = [];
  let branches = [];

  // Yeni: silinecek hizmetin id’si ve onay modal durumu
  let hizmetToDelete = null;
  let showDeleteModal = false;

  let hizmetId = '';
  let hizmetTürü = '';
  let bantGenişliği = '';
  let selectedBranchId = '';
  let kira = '';
  let abonelikTarihi = new Date().toISOString().split('T')[0];
  let showModal = false;

  onMount(() => {
    onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
      if (user) {
        loadHizmetler();
        loadBranches();
      } else {
        goto('/login');
      }
    });
  });

  async function loadHizmetler() {
    const querySnapshot = await getDocs(collection(db, "hizmetler"));
    hizmetler = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async function loadBranches() {
    const querySnapshot = await getDocs(collection(db, "branches"));
    branches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function addHizmet() {
    if (!user) {
      alert('Please Login');
      return;
    }

    const selectedBranch = branches.find(branch => branch.id === selectedBranchId);
    const branchName = selectedBranch ? selectedBranch.branchName : '';

    const docRef = await addDoc(collection(db, "hizmetler"), {
      hizmetId,
      hizmetTürü,
      bantGenişliği,
      branchId: selectedBranchId,
      branchName,
      kira,
      abonelikTarihi,
      userId: user.uid
    });

    hizmetler = [
      ...hizmetler,
      { id: docRef.id, hizmetId, hizmetTürü, bantGenişliği, branchId: selectedBranchId, branchName, kira, abonelikTarihi }
    ];

    hizmetId = '';
    hizmetTürü = '';
    bantGenişliği = '';
    selectedBranchId = '';
    kira = '';
    abonelikTarihi = new Date().toISOString().split('T')[0];
    showModal = false;
  }

  // Var olan deleteHizmet fonksiyonu aynı kaldı
  async function deleteHizmet(id) {
    await deleteDoc(doc(db, "hizmetler", id));
    hizmetler = hizmetler.filter(hizmet => hizmet.id !== id);
  }

  // Yeni: silme öncesi onay modal’ını aç
  function promptDelete(id) {
    hizmetToDelete = id;
    showDeleteModal = true;
  }

  // Yeni: iptal et
  function cancelDelete() {
    hizmetToDelete = null;
    showDeleteModal = false;
  }

  // Yeni: onayla, sil ve modalı kapat
  async function confirmDelete() {
    await deleteHizmet(hizmetToDelete);
    cancelDelete();
  }
</script>

<main class="p-6 bg-gray-100 min-h-screen">
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Services</h1>
      <button on:click={() => showModal = true}
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200">
        Add Service
      </button>
    </div>

    {#if showModal}
      <!-- Add Service Modal -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto w-1/2">
          <!-- ... aynı form içeriği ... -->
        </div>
      </div>
    {/if}

    <!-- Yeni: Delete Onay Modal -->
    {#if showDeleteModal}
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto w-1/3">
          <h2 class="text-xl font-bold mb-4">Are you sure?</h2>
          <p class="mb-6">Are you sure you want to delete this service? This action is irreversible.</p>
          <div class="flex justify-end">
            <button on:click={cancelDelete}
                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mr-2">
              Cancel
            </button>
            <button on:click={confirmDelete}
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
              Yes
            </button>
          </div>
        </div>
      </div>
    {/if}

    <div class="overflow-x-auto shadow-lg rounded-lg">
      <table class="min-w-full bg-white rounded-lg">
        <thead>
          <tr class="bg-gray-800 text-white text-left text-sm leading-normal">
            <th class="py-3 px-6">Service ID</th>
            <th class="py-3 px-6">Service Type</th>
            <th class="py-3 px-6">Branch</th>
            <th class="py-3 px-6">Bandwith</th>
            <th class="py-3 px-6">Rent</th>
            <th class="py-3 px-6">Subscription Date</th>
            <th class="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm font-light">
          {#each hizmetler as hizmet}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6">{hizmet.hizmetId}</td>
              <td class="py-3 px-6">{hizmet.hizmetTürü}</td>
              <td class="py-3 px-6">{hizmet.branchName}</td>
              <td class="py-3 px-6">{hizmet.bantGenişliği}</td>
              <td class="py-3 px-6">{hizmet.kira}</td>
              <td class="py-3 px-6">{hizmet.abonelikTarihi}</td>
              <td class="py-3 px-6 text-right">
                <!-- Eski delete çağrısı yerine promptDelete -->
                <button on:click={() => promptDelete(hizmet.id)}
                        class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg font-medium">
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>
