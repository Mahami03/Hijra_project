<script>
  import { onMount } from "svelte";
  import { getAuth, signOut } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { writable } from "svelte/store";

  const auth = getAuth();
  let isLoading = writable(false);

  onMount(() => {
    isLoading.set(true);
    signOut(auth)
      .then(() => {
        isLoading.set(false);
        goto("/login");
      })
      .catch((error) => {
        isLoading.set(false);
        console.error("Sign out error:", error);
      });
  });
</script>

<main class="flex justify-center items-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
    {#if $isLoading}
      <div class="flex justify-center items-center">
        <div
          class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"
        ></div>
      </div>
      <div class="text-xl font-semibold text-gray-700">Signing out...</div>
    {:else}
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Goodbye!</h1>
      <p class="text-gray-600">You have been successfully signed out.</p>
    {/if}
  </div>
</main>

<style>
  .loader {
    border-top-color: #3490dc;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
