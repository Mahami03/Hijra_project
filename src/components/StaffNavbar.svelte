<script>
  import { auth } from '../lib/firebase';
  import { goto } from '$app/navigation';

  async function logout() {
    await auth.signOut();
    goto('/login');
  }
</script>

<nav class="flex justify-end p-4 bg-gray-800 text-white">
  <button on:click={logout} class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
    Logout
  </button>
</nav>
