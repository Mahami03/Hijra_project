<script>
  import { onMount } from 'svelte';
  import { db, auth } from '../../lib/firebase';
  import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
  import { onAuthStateChanged } from "firebase/auth";

  let user = null;
  let branches = [];
  let branchName = '';
  let branchArea = '';
  let editingBranchId = null;
  let showModal = false;

  onMount(() => {
    onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
      if (user) {
        loadBranches();
      }
    });
  });

  async function loadBranches() {
    const querySnapshot = await getDocs(collection(db, "branches"));
    branches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function addOrUpdateBranch() {
    if (!user) {
      alert('Please Login');
      return;
    }

    const fullBranchName = `${branchName} (${branchArea})`;

    if (editingBranchId) {
      const branchRef = doc(db, "branches", editingBranchId);
      await updateDoc(branchRef, { branchName: fullBranchName });
      branches = branches.map(branch => branch.id === editingBranchId ? { ...branch, branchName: fullBranchName } : branch);
      editingBranchId = null;
    } else {
      const docRef = await addDoc(collection(db, "branches"), {
        branchName: fullBranchName,
        userId: user.uid
      });
      branches = [...branches, { id: docRef.id, branchName: fullBranchName }];
    }

    branchName = '';
    branchArea = '';
    showModal = false;
  }

  function editBranch(branch) {
    const [name, area] = branch.branchName.split(' (');
    editingBranchId = branch.id;
    branchName = name;
    branchArea = area ? area.slice(0, -1) : '';
    showModal = true;
  }

  async function deleteBranch(id) {
    await deleteDoc(doc(db, "branches", id));
    branches = branches.filter(branch => branch.id !== id);
  }
</script>

<main class="p-6 bg-gray-100 min-h-screen">
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Manage Branches</h1>
      <button on:click={() => showModal = true} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200">Add Branch</button>
    </div>

    {#if showModal}
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto w-1/2">
          <h2 class="text-2xl mb-4">{editingBranchId ? 'Edit Branch' : 'Add Branch'}</h2>
          <form on:submit|preventDefault={addOrUpdateBranch}>
            <input id="branchName" placeholder="Branch Name" bind:value={branchName} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            <input id="branchArea" placeholder="Branch Area" bind:value={branchArea} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            <div class="flex justify-end">
              <button type="button" on:click={() => { showModal = false; editingBranchId = null; }} class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mr-2">Cancel</button>
              <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">{editingBranchId ? 'Update Branch' : 'Add Branch'}</button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <div class="overflow-x-auto shadow-lg rounded-lg">
      <table class="min-w-full bg-white rounded-lg">
        <thead>
          <tr class="bg-gray-900 text-white text-left text-sm leading-normal">
            <th class="py-3 px-5 border-b">Branch Name (Area)</th>
            <th class="py-3 px-5 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm">
          {#each branches as branch}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-5">{branch.branchName}</td>
              <td class="py-3 px-5 text-center">
                <button on:click={() => editBranch(branch)} class="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg font-medium mr-2">Edit</button>
                <button on:click={() => deleteBranch(branch.id)} class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg font-medium">Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>
