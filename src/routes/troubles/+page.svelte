<script>
  import { onMount } from 'svelte';
  import { db, auth } from '../../lib/firebase';
  import { collection, addDoc, updateDoc, doc, getDocs, getDoc } from 'firebase/firestore';
  import { onAuthStateChanged } from "firebase/auth";

  let user = null;
  let sorunlar = [];
  let hizmetler = [];
  let branches = [];
  let selectedHizmetId = '';
  let selectedHizmetTuru = '';
  let selectedBranchId = '';
  let bildirimZamani = '';
  let showModal = false;
  let ttNumber = '';

  onMount(() => {
    const now = new Date();
    const gmtPlus3Time = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    bildirimZamani = gmtPlus3Time.toISOString().slice(0, 16);

    onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
      if (user) {
        loadSorunlar();
        loadHizmetler();
        loadBranches();
      }
    });
  });

  async function loadSorunlar() {
    const querySnapshot = await getDocs(collection(db, "sorunlar"));
    sorunlar = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    sorunlar.sort((a, b) => a.isCompleted - b.isCompleted);
  }

  async function loadHizmetler() {
    const querySnapshot = await getDocs(collection(db, "hizmetler"));
    hizmetler = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function loadBranches() {
    const querySnapshot = await getDocs(collection(db, "branches"));
    branches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  function handleHizmetChange(event) {
    const selectedHizmet = hizmetler.find(hizmet => hizmet.hizmetId === event.target.value);
    selectedHizmetId = selectedHizmet ? selectedHizmet.hizmetId : '';
    selectedHizmetTuru = selectedHizmet ? selectedHizmet.hizmetTürü : '';
  }

  async function addSorun() {
    if (!user) {
      alert('Please Login');
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    const docRef = await addDoc(collection(db, "sorunlar"), {
      hizmetId: selectedHizmetId,
      hizmetTürü: selectedHizmetTuru,
      branchId: selectedBranchId,
      bildirimZamani,
      sorunuBildiren: `${userData.name} ${userData.lastName}`,
      ttNumber,
      isCompleted: false,
      userId: user.uid
    });

    sorunlar = [...sorunlar, {
      id: docRef.id,
      hizmetId: selectedHizmetId,
      hizmetTürü: selectedHizmetTuru,
      branchId: selectedBranchId,
      bildirimZamani,
      sorunuBildiren: `${userData.name} ${userData.lastName}`,
      ttNumber,
      isCompleted: false
    }];

    sorunlar.sort((a, b) => a.isCompleted - b.isCompleted);
    showModal = false;
  }

  async function markAsCompleted(id) {
    const çözümZamani = new Date().toISOString();
    const sorunRef = doc(db, "sorunlar", id);
    await updateDoc(sorunRef, {
        isCompleted: true,
        çözümZamani: çözümZamani
    });

    sorunlar = sorunlar.map(sorun =>
        sorun.id === id ? { ...sorun, isCompleted: true, çözümZamani } : sorun
    );
    sorunlar.sort((a, b) => a.isCompleted - b.isCompleted);
}

</script>

<main class="p-6 bg-gray-100 min-h-screen">
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Troubles</h1>
      <button on:click={() => showModal = true} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200">Add Trouble</button>
    </div>

    {#if showModal}
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto w-1/2">
          <h2 class="text-2xl mb-4">New Trouble</h2>
          <form on:submit|preventDefault={addSorun}>
            <div class="mb-4">
              <select bind:value={selectedHizmetId} class="w-full p-3 border border-gray-300 rounded-lg" on:change={handleHizmetChange}>
                <option value="" disabled>Select Service</option>
                {#each hizmetler as hizmet}
                  <option value={hizmet.hizmetId}>{hizmet.hizmetTürü}</option>
                {/each}
              </select>
            </div>

            <div class="mb-4">
              <input type="text" value={selectedHizmetId} class="w-full p-3 border border-gray-300 rounded-lg" readonly />
            </div>
            
            <div class="mb-4">
              <select bind:value={selectedBranchId} class="w-full p-3 border border-gray-300 rounded-lg">
                <option value="" disabled>Select Branch</option>
                {#each branches as branch}
                  <option value={branch.id}>{branch.branchName}</option>
                {/each}
              </select>
            </div>

            <div class="mb-4">
              <input type="text" placeholder="TT Number" bind:value={ttNumber} class="w-full p-3 border border-gray-300 rounded-lg" />
            </div>

            <div class="mb-4">
              <input type="datetime-local" bind:value={bildirimZamani} class="w-full p-3 border border-gray-300 rounded-lg" placeholder="Reported Time" />
            </div>
            
            <div class="flex justify-end">
              <button type="button" on:click={() => showModal = false} class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mr-2">Cancel</button>
              <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200">Add Trouble</button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <div class="overflow-x-auto shadow-lg rounded-lg">
      <table class="min-w-full bg-white rounded-lg">
        <thead>
          <tr class="bg-gray-900 text-white text-left text-sm leading-normal">
            <th class="py-3 px-6">Service ID</th>
            <th class="py-3 px-6">Service Type</th>
            <th class="py-3 px-6">Branch Name</th>
            <th class="py-3 px-6">Reported Time</th>
            <th class="py-3 px-6">Reported By</th>
            <th class="py-3 px-6">TT Number</th>
            <th class="py-3 px-6"></th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm font-light">
          {#each sorunlar as sorun}
            <tr class="border-b border-gray-200 hover:bg-gray-100 {sorun.isCompleted ? 'bg-green-100' : ''}">
              <td class="py-3 px-6">{sorun.hizmetId}</td>
              <td class="py-3 px-6">{sorun.hizmetTürü}</td>
              <td class="py-3 px-6">{branches.find(branch => branch.id === sorun.branchId)?.branchName || ''}</td>
              <td class="py-3 px-6">{sorun.bildirimZamani}</td>
              <td class="py-3 px-6">{sorun.sorunuBildiren}</td>
              <td class="py-3 px-6">{sorun.ttNumber}</td>
              <td class="py-3 px-6 text-right">
                {#if !sorun.isCompleted}
                  <button on:click={() => markAsCompleted(sorun.id)} class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200">Resolve</button>
                {:else}
                  <span class="text-green-700 font-bold">Resolved</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>
