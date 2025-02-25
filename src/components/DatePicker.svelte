<script>
    import { onMount, onDestroy } from 'svelte';
    import flatpickr from 'flatpickr';
    import 'flatpickr/dist/flatpickr.min.css';
    import { X } from 'lucide-svelte';

    export let startDate = '';
    export let endDate = '';
    export let onDateRangeChange = () => {};

    let datePicker;
    let inputField;

    onMount(() => {
        datePicker = flatpickr(inputField, {
            mode: 'range',
            dateFormat: 'Y-m-d H:i',
            enableTime: true,
            time_24hr: true,
            defaultDate: [startDate, endDate],
            onChange: function(selectedDates) {
                if (selectedDates.length === 2) {
                    onDateRangeChange(
                        selectedDates[0].toISOString().replace('T', ' ').slice(0, 16),
                        selectedDates[1].toISOString().replace('T', ' ').slice(0, 16)
                    );
                }
            }
        });
    });

    onDestroy(() => {
        datePicker?.destroy();
    });

    function clearDateRange() {
        datePicker.clear();
        onDateRangeChange('', '');
    }
</script>

<div class="relative">
    <input
        bind:this={inputField}
        id="date-range-picker"
        type="text"
        placeholder="Select date range..."
        class="p-2 border border-gray-300 rounded transition duration-150 ease-in-out w-full pr-10"
    />
    <button
        type="button"
        on:click={clearDateRange}
        class="absolute inset-y-0 right-0 flex items-center px-2"
        aria-label="Clear date range"
    >
        <X class="w-4 h-4 text-gray-500" />
    </button>
</div>
