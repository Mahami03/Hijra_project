<script>
  import { onMount } from 'svelte';
  import { db, auth } from '../../lib/firebase';
  import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { onAuthStateChanged } from "firebase/auth";
  import { goto } from '$app/navigation';

  let user = null;
  let hizmetler = [];
  let branches = [];
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

    hizmetler = [...hizmetler, { id: docRef.id, hizmetId, hizmetTürü, bantGenişliği, branchId: selectedBranchId, branchName, kira, abonelikTarihi }];

    hizmetId = '';
    hizmetTürü = '';
    bantGenişliği = '';
    selectedBranchId = '';
    kira = '';
    abonelikTarihi = new Date().toISOString().split('T')[0];
    showModal = false;
  }

  async function deleteHizmet(id) {
    await deleteDoc(doc(db, "hizmetler", id));
    hizmetler = hizmetler.filter(hizmet => hizmet.id !== id);
  }
</script>

<main class="p-6 bg-gray-100 min-h-screen">
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Services</h1>
      <button on:click={() => showModal = true} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200">Add Service</button>
    </div>

    {#if showModal}
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto w-1/2">
          <h2 class="text-2xl mb-4">New Service</h2>
          <form on:submit|preventDefault={addHizmet}>
            <div class="mb-4">
              <input placeholder="Service ID" bind:value={hizmetId} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            </div>
            <div class="mb-4">
              <input placeholder="Service Type" bind:value={hizmetTürü} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            </div>
            <div class="mb-4">
              <select bind:value={selectedBranchId} class="w-full mb-2 p-2 border border-gray-300 rounded">
                <option value="" disabled selected>Select Branch</option>
                {#each branches as branch}
                  <option value={branch.id}>{branch.branchName}</option>
                {/each}
              </select>
            </div>
            <div class="mb-4">
              <input placeholder="Bandwith" bind:value={bantGenişliği} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            </div>
            <div class="mb-4">
              <input placeholder="Rent" bind:value={kira} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            </div>
            <div class="mb-4">
              <input placeholder="Subscription Date" type="date" bind:value={abonelikTarihi} class="w-full mb-4 p-2 border border-gray-300 rounded" />
            </div>
            <div class="flex justify-end">
              <button type="button" on:click={() => showModal = false} class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mr-2">Cancel</button>
              <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Add Service</button>
            </div>
          </form>
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
                <button on:click={() => deleteHizmet(hizmet.id)} class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg font-medium">Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>
