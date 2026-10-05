<script>
  import { fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import Plus from '@lucide/svelte/icons/plus'
  import Sun from '@lucide/svelte/icons/sun'
  import Moon from '@lucide/svelte/icons/moon'
  import SunMoon from '@lucide/svelte/icons/sun-moon'
  import Wrench from '@lucide/svelte/icons/wrench'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { db } from '../../db.js'
  import { liveData } from '../liveQuery.svelte.js'
  import { nav } from '../nav.svelte.js'
  import { theme } from '../theme.svelte.js'
  import { formatDate } from '../entretiens.js'
  import { operationDe } from '../operations.js'
  import Header from '../Header.svelte'
  import BlobImg from '../BlobImg.svelte'
  import VehiculeIcon from '../VehiculeIcon.svelte'
  import Compteur from '../Compteur.svelte'

  const vehicules = liveData(() => db.vehicules.toArray(), [])
  const entretiens = liveData(() => db.entretiens.toArray(), [])
  // Photos "profil" : rattachées au véhicule mais à aucun entretien.
  const photosProfil = liveData(
    () => db.photos.filter((p) => p.entretienId == null && p.pieceId == null).toArray(),
    []
  )

  function dernierEntretien(vehiculeId) {
    const liste = entretiens.value.filter((e) => e.vehiculeId === vehiculeId)
    if (!liste.length) return null
    return liste.reduce((a, b) => (a.date > b.date ? a : b))
  }

  function photoProfil(vehiculeId) {
    return photosProfil.value.find((p) => p.vehiculeId === vehiculeId)
  }

  const LIBELLE_TYPE = { voiture: 'Voiture', moto: 'Moto', motoculture: 'Motoculture' }
  const THEME = {
    systeme: { icone: SunMoon, label: 'Auto' },
    clair: { icone: Sun, label: 'Clair' },
    sombre: { icone: Moon, label: 'Sombre' },
  }
  const themeCourant = $derived(THEME[theme.choix])
</script>

<Header titre="Mes véhicules">
  {#snippet actions()}
    <button
      class="theme-btn"
      onclick={() => theme.suivant()}
      aria-label="Thème : {themeCourant.label}. Toucher pour changer."
    >
      <themeCourant.icone size={20} />
      <span>{themeCourant.label}</span>
    </button>
  {/snippet}
</Header>

<div class="screen">
  {#if vehicules.value.length === 0}
    <div class="empty">
      <div class="empty__plaques">
        <span class="empty__badge t-voiture"><VehiculeIcon type="voiture" size={26} /></span>
        <span class="empty__badge t-moto"><VehiculeIcon type="moto" size={26} /></span>
        <span class="empty__badge t-motoculture"><VehiculeIcon type="motoculture" size={26} /></span>
      </div>
      <h2>Aucun véhicule</h2>
      <p>Ajoutez une voiture, une moto ou une machine pour commencer son carnet d’entretien.</p>
      <button class="btn btn--primary" onclick={() => nav.aller('ajouter-vehicule')}>
        <Plus size={20} /> Ajouter un véhicule
      </button>
    </div>
  {/if}

  <div class="plaques">
    {#each vehicules.value as v, i (v.id)}
      {@const dernier = dernierEntretien(v.id)}
      {@const photo = photoProfil(v.id)}
      <button
        class="plaque vehicule t-{v.type}"
        style:view-transition-name="vehicule-{v.id}"
        onclick={() => nav.aller('vehicule', { vehiculeId: v.id })}
        in:fly={{ y: 14, duration: 260, delay: i * 40, easing: cubicOut }}
      >
        <span class="vehicule__badge" role="img" aria-label={LIBELLE_TYPE[v.type] || v.type}><VehiculeIcon type={v.type} size={24} /></span>
        <span class="vehicule__corps">
          <span class="vehicule__nom">{v.nom}</span>
          <Compteur valeur={v.compteurActuel} unite={v.uniteCompteur} taille="sm" />
          <span class="vehicule__dernier">
            <Wrench size={14} />
            {#if dernier}
              {operationDe(dernier).label} · {formatDate(dernier.date)}
            {:else}
              Aucun entretien
            {/if}
          </span>
        </span>
        {#if photo}
          <span class="vehicule__photo"><BlobImg blob={photo.blob} alt="" /></span>
        {:else}
          <ChevronRight class="vehicule__chevron" size={22} />
        {/if}
      </button>
    {/each}
  </div>
</div>

{#if vehicules.value.length}
  <button class="fab" onclick={() => nav.aller('ajouter-vehicule')} aria-label="Ajouter un véhicule">
    <Plus size={28} strokeWidth={2.25} />
  </button>
{/if}

<style>
  .theme-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 40px;
    padding: 0 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink-2);
    font-size: 0.85rem;
    font-weight: 600;
    transition: transform 120ms var(--ease);
  }
  .theme-btn:active {
    transform: scale(0.95);
  }
  .plaques {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .vehicule {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.9rem;
    width: 100%;
    padding: 1rem;
    text-align: left;
    color: var(--ink);
    transition: transform 140ms var(--ease);
  }
  .vehicule:active {
    transform: scale(0.98);
  }
  .vehicule__badge {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--p);
    color: var(--p-soft);
    box-shadow: inset 0 0 0 2px var(--p), inset 0 0 0 3px color-mix(in oklab, var(--p-soft) 70%, transparent);
    align-self: start;
  }
  .vehicule__corps {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    min-width: 0;
  }
  .vehicule__nom {
    font-family: var(--font-cond);
    font-size: 1.45rem;
    font-weight: 600;
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .vehicule__dernier {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.88rem;
    color: var(--ink-2);
  }
  .vehicule__photo {
    width: 64px;
    height: 64px;
    border-radius: var(--r-md);
    overflow: hidden;
    border: 2px solid var(--surface);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--p) 40%, transparent);
  }
  .vehicule__photo :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .vehicule :global(.vehicule__chevron) {
    color: var(--p-ink);
    opacity: 0.7;
  }
  .empty__plaques {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }
  .empty__badge {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--p-soft);
    color: var(--p-ink);
    border: 1px solid color-mix(in oklab, var(--p) 45%, transparent);
  }
  .empty h2 {
    font-size: 1.5rem;
    text-transform: uppercase;
    color: var(--ink);
  }
  .empty p {
    margin: 0 0 0.75rem;
    max-width: 30ch;
  }
  .fab {
    position: fixed;
    right: max(1.25rem, calc((100vw - 38rem) / 2));
    bottom: calc(env(safe-area-inset-bottom, 0px) + 1.25rem);
    z-index: 20;
    display: grid;
    place-items: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: var(--tile);
    color: var(--tile-ink);
    box-shadow: inset 0 0 0 3px var(--tile), inset 0 0 0 4px var(--tile-rim), var(--shadow-float);
    view-transition-name: fab;
    transition: transform 140ms var(--ease);
  }
  .fab:active {
    transform: scale(0.92);
  }
</style>
