<script>
  import { onMount } from 'svelte';
  import { db } from '../../lib/firebase';
  import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

  let users = [];
  let name = '';
  let lastName = '';
  let role = 'staff';
  let email = '';
  let editingUserId = null;
  let showModal = false;

  onMount(() => {
    loadUsers();
  });

  async function loadUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function updateUser() {
    const userData = { name, lastName, role };

    if (editingUserId) {
      const userRef = doc(db, "users", editingUserId);
      await updateDoc(userRef, userData);
      users = users.map(user => user.id === editingUserId ? { ...user, ...userData } : user);
      editingUserId = null;
    }

    name = '';
    lastName = '';
    role = 'staff';
    showModal = false;
  }

  function editUser(user) {
    editingUserId = user.id;
    name = user.name;
    lastName = user.lastName;
    role = user.role;
    email = user.email;
    showModal = true;
  }

  async function sendPasswordReset(userEmail) {
    try {
      await sendPasswordResetEmail(auth, userEmail);
      alert('Şifre sıfırlama e-postası gönderildi.');
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
    }
  }
</script>

<main class="p-6 bg-gray-100 min-h-screen">
  <div class="container mx-auto">
    <h1 class="text-4xl font-bold text-gray-800 mb-8">User Management</h1>

    <div class="overflow-x-auto shadow-lg rounded-lg">
      <table class="min-w-full bg-white rounded-lg">
        <thead>
          <tr class="bg-gray-900 text-white text-left text-sm leading-normal">
            <th class="py-3 px-5 border-b">First Name</th>
            <th class="py-3 px-5 border-b">Last Name</th>
            <th class="py-3 px-5 border-b">Email</th>
            <th class="py-3 px-5 border-b">Role</th>
            <th class="py-3 px-5 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm">
          {#each users as user}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-5">{user.name}</td>
              <td class="py-3 px-5">{user.lastName}</td>
              <td class="py-3 px-5">{user.email}</td>
              <td class="py-3 px-5">{user.role}</td>
              <td class="py-3 px-5 text-center">
                <button on:click={() => editUser(user)} class="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg font-medium mr-2">Edit</button>
                <button on:click={() => sendPasswordReset(user.email)} class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg font-medium">Reset Password</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if showModal}
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto w-1/2">
          <h2 class="text-2xl mb-4">Edit User</h2>
          <form on:submit|preventDefault={updateUser}>
            <input id="name" placeholder="First Name" bind:value={name} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            <input id="lastName" placeholder="Last Name" bind:value={lastName} class="w-full mb-2 p-2 border border-gray-300 rounded" />
            <select id="role" bind:value={role} class="w-full mb-4 p-2 border border-gray-300 rounded">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <div class="flex justify-end">
              <button type="button" on:click={() => { showModal = false; editingUserId = null; }} class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mr-2">Cancel</button>
              <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Update User</button>
            </div>
          </form>
        </div>
      </div>
    {/if}
  </div>
</main>
