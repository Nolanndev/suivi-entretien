import { liveQuery } from 'dexie'

// Petit pont entre les observables Dexie (liveQuery) et les runes Svelte 5 :
// la vue se met à jour automatiquement à chaque écriture en IndexedDB.
export function liveData(queryFn, initial = undefined) {
  let value = $state(initial)

  $effect(() => {
    const sub = liveQuery(queryFn).subscribe({
      next: (v) => (value = v),
      error: (e) => console.error('liveQuery error', e),
    })
    return () => sub.unsubscribe()
  })

  return {
    get value() {
      return value
    },
  }
}
