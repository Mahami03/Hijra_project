<script>
import { onMount } from 'svelte';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { goto } from '$app/navigation';

const db = getFirestore();
let menuOpen = false;
let userName = '';
let showNavbar = false;

function toggleMenu() {
  menuOpen = !menuOpen;
}

function logout() {
  signOut(auth).then(() => {
    goto('/login');
  }).catch((error) => {
    console.error('Error signing out: ', error);
  });
}


onMount(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('User is logged in');
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      userName = userData ? userData.name : user.displayName || user.email;
      showNavbar = true;
    } else {
      console.log('No user logged in');
      showNavbar = false;
    }
  });

  return () => unsubscribe();
});

</script>

{#if showNavbar}
  <div class="md:fixed md:w-full md:top-0 md:z-20 flex flex-row flex-wrap items-center bg-white p-6 border-b border-gray-300">
    <div class="flex-none w-56 flex flex-row items-center">
      <img src="./hijraP.jpeg" alt="HijraLogo" class="h-8 w-auto"/>
      <strong class="capitalize ml-1 flex-1">Hjira Bank</strong>

      <button id="sliderBtn" class="flex-none text-right text-gray-900 hidden md:block">
        <i class="fad fa-list-ul"></i>
      </button>
    </div>

    <button id="navbarToggle" class="hidden md:block md:fixed right-0 mr-6">
      <i class="fad fa-chevron-double-down"></i>
    </button>

    <div id="navbar" class="animated md:hidden md:fixed md:top-0 md:w-full md:left-0 md:mt-16 md:border-t md:border-b md:border-gray-200 md:p-10 md:bg-white flex-1 pl-3 flex flex-row flex-wrap justify-between items-center md:flex-col md:items-center">

      <div class="flex flex-row-reverse items-center ml-auto"> 

        <div class="relative">
          <button class="menu-btn focus:outline-none focus:shadow-outline flex items-center" on:click={toggleMenu}>
            <div class="w-8 h-8 overflow-hidden rounded-full">
              <i class="fad fa-user"></i>
            </div> 

            <div class="ml-2 capitalize flex">
              <h1 class="text-sm text-gray-800 font-semibold m-0 p-0 leading-none">{userName}</h1>
              <i class="fad fa-chevron-down ml-2 text-xs leading-none"></i>
            </div>
          </button>

          {#if menuOpen}
            <div class="text-gray-500 absolute mt-2 right-0 w-40 bg-white shadow-md rounded py-2 z-20">
              <button class="px-4 py-2 block capitalize font-medium text-sm tracking-wide hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 ease-in-out cursor-pointer" on:click={logout}>
                <i class="fad fa-sign-out-alt text-xs mr-1"></i> 
                Log Out
              </button>     
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
