<script>
    export let hizmetTürü = '';
    export let bantGenişliği = '';
    export let konum = '';
    export let kira = '';
    export let abonelikTarihi = '';
  </script>
  
<form on:submit|preventDefault={addHizmet} class="max-w-lg mx-auto p-4 bg-white shadow rounded">
    <h1 class="text-2xl font-semibold mb-4">Hizmet Ekle</h1>
    <input placeholder="Hizmet Türü" bind:value={hizmetTürü} class="w-full mb-2 p-2 border border-gray-300 rounded" />
    <input placeholder="Bant Genişliği" bind:value={bantGenişliği} class="w-full mb-2 p-2 border border-gray-300 rounded" />
    <input placeholder="Konum" bind:value={konum} class="w-full mb-2 p-2 border border-gray-300 rounded" />
    <input placeholder="Kira" bind:value={kira} class="w-full mb-2 p-2 border border-gray-300 rounded" />
    <input placeholder="Abonelik Tarihi" type="date" bind:value={abonelikTarihi} class="w-full mb-4 p-2 border border-gray-300 rounded" />
    <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Hizmet Ekle</button>
  </form>