<script>
  import Car from '@lucide/svelte/icons/car-front'
  import Motorbike from '@lucide/svelte/icons/motorbike'
  import Tractor from '@lucide/svelte/icons/tractor'

  let { type, size = 24, strokeWidth = 1.75 } = $props()

  const Icone = $derived(type === 'moto' ? Motorbike : type === 'motoculture' ? Tractor : Car)
</script>

<Icone {size} {strokeWidth} aria-hidden="true" />
