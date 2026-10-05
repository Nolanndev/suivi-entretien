---
version: 1
slug: "src-app-svelte"
primary_target: "src/App.svelte"
related_targets: ["src/lib"]
---

# Surface: the whole app (Accueil, Fiche véhicule, Entretien detail/form)

Mode: Operate. Mobile-first iPhone PWA, used in the garage with dirty hands and from the couch.
Task: log a maintenance record in under a minute (parts + costs, photos/invoices/documents), reread and edit the history.
User constraints (pinned): simple; light/dark theme with a toggle, system by default; soft colours easy on the eyes; human, mechanical feel, never AI-like; icons almost everywhere (one real library, one stroke); smooth transitions between screens and actions. No tab bar: theme toggle in the home header.

## Direction contract

THESIS: Every vehicle is a faded enamel plate: soft enamel blue/celadon/amber, condensed capital lettering, a rolled edge. It refuses the default iOS grey list with one blue accent.
OWN-WORLD: Pale zinc ground (light) / deep enamel navy (dark); faded enamel plates with a 2px inner rim; condensed grotesque type for titles and figures, a neutral sans for text; Lucide icons, 1.75 stroke; tabular figures aligned right; full colour reserved for the plates (vehicle, meter, status).
STORY: You recognise your vehicles at a glance, open one, read its history like a logbook, and add or fix a record without hunting.
FIRST VIEWPORT: Home header (title + theme toggle), then a stack of vehicle plates: type icon in an enamel badge, condensed name, meter as "street plate" figure tiles, last service. A floating + button at the bottom right for the thumb.
FORM: Plaque émaillée, candidate 7 of 7 on my list, seed key 3d64089a. Signature: the meter set in enamel figure tiles (vehicle page and cards). Motion: native view transitions between screens (180-240 ms, ease-out), list slide/fade.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Raises: destructive actions isolated by empty space (console); right-aligned tabular figures, totals that add up (j-card); colour confined to the plates (lexicon).
