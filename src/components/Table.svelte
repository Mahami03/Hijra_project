<script>
    import DatePicker from '../components/DatePicker.svelte';

    export let headers = [];
    export let data = [];
    export let searchTerm = '';
    export let itemsPerPage = 5;
    export let currentPage = 1;

    let filteredData = [];
    let totalPages = 0;

    let startDate = '';
    let endDate = '';

    $: {
        filteredData = data
            .filter(row => {
                const matchesSearch = headers.some(header =>
                    row[header.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );

                const reportedTime = new Date(row.bildirimZamani);
                const start = new Date(startDate);
                const end = new Date(endDate);
                const matchesDateRange = (!startDate || !endDate) ||
                    (reportedTime >= start && reportedTime <= end);

                return matchesSearch && matchesDateRange;
            });

        totalPages = Math.ceil(filteredData.length / itemsPerPage);
    }

    $: paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    function handleDateRangeChange(start, end) {
        startDate = start;
        endDate = end;
    }
</script>

<div class="mb-6 flex items-center justify-between">
    <div class="w-1/4">
        <input
        type="text"
        placeholder="Search..."
        bind:value={searchTerm}
        class="p-2 border border-gray-300 rounded w-full"
    />
    </div>
    <div class=" w-4/12">
    <DatePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
    />
    </div>
</div>

<div class="overflow-x-auto shadow-lg rounded-lg">
    <table class="min-w-full bg-white rounded-lg border border-gray-200">
        <thead>
            <tr class="bg-gray-900 text-white text-left text-sm leading-normal">
                {#each headers as { key, label }}
                    <th class="py-3 px-6">{label}</th>
                {/each}
            </tr>
        </thead>
        <tbody class="text-gray-700 text-sm font-light">
            {#each paginatedData as row}
                <tr class="border-b border-gray-200 hover:bg-gray-100">
                    {#each headers as { key }}
                        <td class="py-3 px-6">{row[key]}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<div class="mt-4 flex justify-between items-center">
    <button
        on:click={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
    >
        Previous
    </button>
    <div class="flex items-center">
        <span class="text-gray-700">Page {currentPage} of {totalPages}</span>
    </div>
    <button
        on:click={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
    >
        Next
    </button>
</div>
