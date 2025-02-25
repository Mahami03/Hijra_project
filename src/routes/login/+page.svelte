<script>
  import { auth } from '../../lib/firebase';
  import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { goto } from '$app/navigation';
  import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

  const db = getFirestore();
  let email = '';
  let password = '';
  let name = '';
  let lastName = '';
  let isSignUp = false;
  let error = '';
  let role = 'staff'; 

  async function handleAuth() {
  try {
    if (isSignUp) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${name} ${lastName}`
      });

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        lastName: lastName,
        email: email,
        role: role
      });

      alert('Registration successful!');
      goto('/');
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData.role === 'admin') {
        goto('/report');
      } else if (userData.role === 'staff') {
        goto('/troubles');
      } else {
        error = 'Invalid role';
      }
    }
  } catch (e) {
    error = e.message;
  }
}

</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-900">{isSignUp ? 'Sign Up' : 'Login'}</h1>

    <form on:submit|preventDefault={handleAuth} class="space-y-4">
      <div class="flex flex-col">
        <label for="email" class="text-sm font-semibold text-gray-700">Email</label>
        <input id="email" type="email" placeholder="Email" bind:value={email} class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div class="flex flex-col">
        <label for="password" class="text-sm font-semibold text-gray-700">Password</label>
        <input id="password" type="password" placeholder="Password" bind:value={password} class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      {#if isSignUp}
        <div class="flex flex-col">
          <label for="name" class="text-sm font-semibold text-gray-700">Name</label>
          <input id="name" type="text" placeholder="Name" bind:value={name} class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        
        <div class="flex flex-col">
          <label for="lastName" class="text-sm font-semibold text-gray-700">Last Name</label>
          <input id="lastName" type="text" placeholder="Last Name" bind:value={lastName} class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
      {/if}

      <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition duration-200">
        {isSignUp ? 'Sign Up' : 'Login'}
      </button>
    </form>

    {#if error}
      <p class="text-red-500 mt-4 text-center text-sm">{error}</p>
    {/if}

    <button on:click={() => isSignUp = !isSignUp} class="mt-6 text-blue-500 hover:underline w-full text-center text-sm">
      {isSignUp ? 'I already have an account' : 'Don\'t have an account? Sign up'}
    </button>
  </div>
</main>
