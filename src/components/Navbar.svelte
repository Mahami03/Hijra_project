<script>
  import { onMount } from 'svelte';
  import { signOut, onAuthStateChanged } from 'firebase/auth';
  import { auth } from '../lib/firebase';
  import { goto } from '$app/navigation';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../lib/firebase';

  let showSidebar = false;
  let userRole = '';

  async function getUserRole(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().role;
      } else {
        console.error('No such document!');
        return '';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      return '';
    }
  }

  function logout() {
    signOut(auth).then(() => {
      goto('/login');
    });
  }

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        showSidebar = true;
        userRole = await getUserRole(user.uid);
      } else {
        showSidebar = false;
      }
    });

    return () => unsubscribe();
  });
</script>

{#if showSidebar}
  <div id="sideBar"
    class="relative flex flex-col flex-wrap bg-white border-r border-gray-300 p-6 flex-none w-64 md:-ml-64 md:fixed md:top-0 md:z-30 md:h-screen md:shadow-xl animated faster">
    
    <div class="flex flex-col">
      <p class="uppercase text-xs text-gray-600 mb-4 tracking-wider">home</p>

      <a href="/dashboard" class="mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
        <i class="fad fa-tachometer-alt text-xs mr-2"></i>
        Dashboard
      </a>

      {#if userRole === 'admin'}
        <p class="uppercase text-xs text-gray-600 mb-4 mt-4 tracking-wider">App Settings</p>

        <a href="/report"
          class="mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
          <i class="fad fa-file-alt text-xs mr-2"></i>
          Reports
        </a>

        <a href="/services" class="mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
          <i class="fad fa-concierge-bell text-xs mr-2"></i>
          Services
        </a>

        <a href="/branches" class="mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
          <i class="fad fa-building text-xs mr-2"></i>
          Branches
        </a>

        <a href="/users" class="mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
          <i class="fad fa-users text-xs mr-2"></i>
          User Management
        </a>

      {/if}

      <p class="uppercase text-xs text-gray-600 mb-4 mt-4 tracking-wider">Trouble</p>

      <a href="/troubles" class="mb-3 capitalize font-medium text-sm hover:text-teal-600 transition ease-in-out duration-500">
        <i class="fad fa-exclamation-triangle text-xs mr-2"></i>
        Troubles
      </a>
    </div>
  </div>
{/if}
