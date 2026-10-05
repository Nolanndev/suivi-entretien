<script>
  // Image issue d'un Blob IndexedDB ; l'URL objet est libérée au démontage
  // pour ne pas accumuler de mémoire avec beaucoup de photos.
  let { blob, alt = '', ...rest } = $props()

  const url = $derived(blob ? URL.createObjectURL(blob) : null)
  $effect(() => {
    const u = url
    return () => u && URL.revokeObjectURL(u)
  })
</script>

{#if url}
  <img src={url} {alt} {...rest} />
{/if}
