<script>
  import "../style.css";
  import Navbar from '../components/Navbar.svelte';
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { onMount } from 'svelte';
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  import { goto } from '$app/navigation';
  import Topbar from "../components/Topbar.svelte";

  const auth = getAuth();
  const db = getFirestore();
  let user = null;
  let role = null;
  let loading = true;

  onMount(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        user = currentUser;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        role = userData.role;
      } else {
        goto('/login');
      }
      loading = false; 
    });
  });

  function navigateWithLoading(url) {
    loading = true;
    goto(url).then(() => {
      loading = false;  
    });
  }
</script>

<Topbar /> 

<div class="h-screen flex flex-row flex-wrap">
  <Navbar />
  <div class="bg-gray-100 flex-1 p-6 md:mt-16">
    <slot> </slot>
  </div>
</div>
