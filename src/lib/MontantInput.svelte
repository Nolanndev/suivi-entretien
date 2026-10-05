<script>
  // Saisie d'un montant en euros : accepte la virgule, affiche « 38,90 »
  // hors édition. La valeur liée reste un nombre (ou '' si vide).
  let { value = $bindable(''), ...rest } = $props()

  const format = (v) =>
    v === '' || v == null || isNaN(Number(v))
      ? ''
      : Number(v).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  let texte = $state(format(value))
  let enEdition = false

  $effect(() => {
    const v = value
    if (!enEdition) texte = format(v)
  })

  function onInput(e) {
    texte = e.target.value
    const n = parseFloat(texte.replace(/\s/g, '').replace(',', '.'))
    value = texte.trim() === '' || isNaN(n) ? '' : n
  }
</script>

<input
  type="text"
  inputmode="decimal"
  autocomplete="off"
  value={texte}
  oninput={onInput}
  onfocus={() => (enEdition = true)}
  onblur={() => {
    enEdition = false
    texte = format(value)
  }}
  {...rest}
/>
