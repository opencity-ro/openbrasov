import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

/**
 * Paleta hărții, pe roluri, nu pe straturi. Stilul Liberty are 111 de straturi;
 * le grupăm după ce reprezintă, ca schimbarea unei culori să nu ceară 20 de edituri.
 */
export type MapPalette = {
  /**
   * Lasă vopseaua stilului de bază neatinsă. Ziua vrem exact harta oficială —
   * drumurile galbene, etichetele gri, tot — și adăugăm doar ce lipsește din ea.
   * Culorile de mai jos rămân pentru straturile pe care le creăm noi.
   */
  keepUpstreamPaint: boolean;
  background: string;
  water: string;
  waterway: string;
  park: string;
  wood: string;
  grass: string;
  wetland: string;
  sand: string;
  ice: string;
  residential: string;
  institutional: string;
  pitch: string;
  aeroway: string;
  building: string;
  buildingOutline: string;
  building3d: string;
  motorway: string;
  motorwayCasing: string;
  major: string;
  majorCasing: string;
  minor: string;
  minorCasing: string;
  path: string;
  rail: string;
  boundary: string;
  label: string;
  labelHalo: string;
  labelMuted: string;
  waterLabel: string;
  transitLabel: string;
  /** Opacitatea reliefului Natural Earth, vizibil doar sub zoom 7. */
  reliefOpacity: number;
};

/**
 * Ziua e harta oficială, așa cum o servește furnizorul de dale. Valorile de aici
 * ajung doar în straturile adăugate de noi — numerele de casă, cerul.
 */
export const LIGHT_PALETTE: MapPalette = {
  keepUpstreamPaint: true,
  background: "#f8f4f0",
  water: "#9ebdff",
  waterway: "#9ebdff",
  park: "#d8e8c8",
  wood: "#c7dfb2",
  grass: "#d8e8c8",
  wetland: "#cfddcb",
  sand: "#efe6ce",
  ice: "#e8eef2",
  residential: "#ede9e1",
  institutional: "#e9e5dc",
  pitch: "#d8e4c8",
  aeroway: "#e7e3da",
  building: "#dcd8d1",
  buildingOutline: "#cbc6bd",
  building3d: "#dcd8d1",
  motorway: "#ffcc88",
  motorwayCasing: "#e9ac77",
  major: "#ffeeaa",
  majorCasing: "#e9ac77",
  minor: "#ffffff",
  minorCasing: "#cfcdca",
  path: "#d9d2c4",
  rail: "#bbbbbb",
  boundary: "#9e9cab",
  label: "#333333",
  labelHalo: "rgba(255, 255, 255, 0.9)",
  labelMuted: "#8a8480",
  waterLabel: "#5c87a5",
  transitLabel: "#2e5a80",
  reliefOpacity: 0.35,
};

/**
 * Noaptea: ardezie albastru-cenușie, nu negru. Drumurile stau mai deschise decât
 * terenul, altfel orașul dispare; verdeața rămâne saturată cât să se citească
 * dealurile, iar apa păstrează destul albastru cât să rămână apă.
 */
export const DARK_PALETTE: MapPalette = {
  keepUpstreamPaint: false,
  background: "#2b3038",
  water: "#1e2a36",
  waterway: "#2a3d4d",
  park: "#274a3a",
  wood: "#234433",
  grass: "#2a4d3c",
  wetland: "#283f3a",
  sand: "#3a3a33",
  ice: "#333e46",
  residential: "#2f343d",
  institutional: "#333842",
  pitch: "#2c4a3b",
  aeroway: "#31363f",
  building: "#363c46",
  buildingOutline: "#454c57",
  building3d: "#3b414c",
  // Drumurile mari rămân galbene și noaptea, ca ziua: ele sunt scheletul după
  // care recunoști orașul dintr-o privire, iar în cenușiu se pierdeau printre
  // străzile mărunte. Chihlimbarul e stins, nu aprins — pe fundalul de ardezie
  // iese la 5 la 1 autostrada și 3,8 la 1 drumul principal, adică se citesc
  // limpede fără să lumineze harta. Tot ordinea se păstrează: autostrada peste
  // drumul principal, amândouă peste strada obișnuită.
  motorway: "#d19a45",
  motorwayCasing: "#8f6730",
  major: "#b8853a",
  majorCasing: "#7d5b2b",
  minor: "#414954",
  minorCasing: "#4b535f",
  path: "#454d58",
  rail: "#3a414b",
  boundary: "#4a525e",
  label: "#dbe1e9",
  labelHalo: "rgba(26, 30, 36, 0.85)",
  labelMuted: "#9aa4b2",
  waterLabel: "#7fa8c4",
  transitLabel: "#8db4d6",
  reliefOpacity: 0.15,
};

export const PALETTES = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export type MapThemeName = keyof typeof PALETTES;

type PaintPatch = Record<string, unknown>;

type LayerType = StyleSpecification["layers"][number]["type"];

type LayerRule = {
  /** Prima regulă care se potrivește câștigă, deci ordinea contează. */
  test: RegExp;
  /**
   * Tipul de strat pe care se aplică. Numele nu spune tipul: `waterway_line_label`
   * și `highway-name-minor` sunt etichete, nu linii, iar o proprietate de linie pe
   * un strat `symbol` face stilul invalid și harta nu mai pornește.
   */
  type: LayerType;
  /** Culorile. Nu se aplică atunci când paleta păstrează vopseaua de bază. */
  paint?: (palette: MapPalette) => PaintPatch;
  /** Mărimea și fontul stau în `layout`, nu în `paint`. Se aplică în orice temă. */
  layout?: () => Record<string, unknown>;
  /** Zoom-ul de la care apare stratul. */
  minzoom?: number;
  /**
   * Zoom-ul peste care stratul dispare. Numele orașului nu mai ajută pe nimeni
   * odată ce ești pe strada lui — acolo contează cartierul, nu localitatea.
   */
  maxzoom?: number;
};

/**
 * Glifele sunt generate de noi din Inter și servite de pe domeniul propriu
 * (`pnpm map:glyphs`). Stilul de bază cere fonturi Noto de la furnizorul de dale;
 * le înlocuim pe toate, altfel etichetele ar cere fișiere care la noi nu există.
 */
export const GLYPHS_VERSION = "3";
export const GLYPHS_URL = `/map-fonts/${GLYPHS_VERSION}/{fontstack}/{range}.pbf`;

/**
 * Prioritatea punctelor de interes, luată din stilul oficial OSM.
 *
 * Acolo fiecare tip apare de la un anumit zoom: spitalul de la 15, farmacia și
 * restaurantul de la 17, bancomatul de la 18, banca de gunoi de la 19. Numărul
 * acela e o măsură a importanței, așa că îl folosim ca ordine de așezare: când
 * două etichete se calcă, rămâne cea pe care ei o arată mai devreme. Extras din
 * `style/amenity-points.mss`, nu scris din memorie.
 */
const POI_PRIORITY_BY_ZOOM: Array<[number, string[]]> = [
  [4, ["island"]],
  [9, ["scree", "shingle"]],
  [11, ["islet", "peak", "volcano"]],
  [13, ["alpine_hut", "wilderness_hut"]],
  [14, ["cape", "level_crossing", "made_communications_tower", "spring"]],
  [
    15,
    [
      "cave_entrance",
      "crossing",
      "ferry_terminal",
      "golf_course",
      "hospital",
      "made_lighthouse",
      "pass",
      "saddle",
    ],
  ],
  [
    16,
    [
      "archaeological_site",
      "beach_resort",
      "bus_station",
      "camp_site",
      "caravan_site",
      "castle",
      "cinema",
      "courthouse",
      "fire_station",
      "ford",
      "fort",
      "helipad",
      "hunting_stand",
      "library",
      "locality",
      "made_cross",
      "made_windmill",
      "manor",
      "marketplace",
      "monument",
      "museum",
      "peninsula",
      "picnic_site",
      "place_of_worship",
      "police",
      "shelter",
      "theatre",
      "toll_booth",
      "townhall",
      "viewpoint",
      "water_park",
      "wayside_cross",
    ],
  ],
  [
    17,
    [
      "amusement_arcade",
      "arts_centre",
      "artwork",
      "attraction",
      "bank",
      "bar",
      "bbq",
      "bicycle_rental",
      "biergarten",
      "bird_hide",
      "boat_rental",
      "bowling_alley",
      "bunker",
      "bureau_de_change",
      "cafe",
      "car_rental",
      "car_wash",
      "casino",
      "cattle_grid",
      "chalet",
      "charging_station",
      "city_gate",
      "clinic",
      "community_centre",
      "consulate",
      "cycle_barrier",
      "dance",
      "dentist",
      "doctors",
      "dog_park",
      "drinking_water",
      "driving_school",
      "embassy",
      "fast_food",
      "firepit",
      "fishing",
      "fitness_centre",
      "fitness_station",
      "food_court",
      "fountain",
      "fuel",
      "gallery",
      "gate",
      "guest_house",
      "hostel",
      "hotel",
      "ice_cream",
      "internet_cafe",
      "kissing_gate",
      "lift_gate",
      "made_ceremonial_gate",
      "made_chimney",
      "made_crane",
      "made_obelisk",
      "made_telescope",
      "made_tower",
      "made_waste_water_plant",
      "made_water_tower",
      "miniature_golf",
      "motel",
      "motorcycle_barrier",
      "nightclub",
      "parcel_locker",
      "pharmacy",
      "picnic_table",
      "playground",
      "post_office",
      "prison",
      "pub",
      "public_bath",
      "restaurant",
      "sauna",
      "slipway",
      "social_facility",
      "square",
      "stile",
      "swimming_area",
      "swing_gate",
      "taxi",
      "telephone",
      "traffic_signals",
      "tree",
      "vehicle_inspection",
      "veterinary",
      "wayside_shrine",
    ],
  ],
  [
    18,
    [
      "apartment",
      "atm",
      "elevator",
      "made_mast",
      "made_silo",
      "made_storage_tank",
      "phone",
      "post_box",
      "shower",
    ],
  ],
  [
    19,
    [
      "bench",
      "bicycle_repair_station",
      "column",
      "information",
      "outdoor_seating",
      "public_bookcase",
      "recycling",
      "vending_machine",
      "waste_basket",
      "waste_disposal",
    ],
  ],
];

/** Tipurile fără regulă proprie la ei cad pe pragul cel mai des folosit. */
const POI_DEFAULT_PRIORITY = 17;

/**
 * Ordinea de așezare a sesizărilor. Harta există pentru ele, deci nu au voie să
 * piardă vreodată locul în fața unei farmacii sau a unei stații: valoarea stă
 * sub cea mai mică prioritate a punctelor de interes, iar un test o verifică.
 * Stratul de sesizări o folosește ca `symbol-sort-key`.
 */
export const REPORT_SORT_KEY = 0;

/** Cea mai mică valoare folosită de punctele de interes; sesizările stau sub ea. */
export function lowestPoiSortKey(): number {
  return Math.min(POI_DEFAULT_PRIORITY, ...POI_PRIORITY_BY_ZOOM.map(([zoom]) => zoom));
}

function poiSortKey(): unknown {
  return [
    "match",
    ["get", "subclass"],
    ...POI_PRIORITY_BY_ZOOM.flatMap(([zoom, subclasses]) => [subclasses, zoom]),
    POI_DEFAULT_PRIORITY,
  ];
}

/**
 * Cum încap mai multe etichete pe aceeași stradă.
 *
 * MapLibre așază o etichetă într-un singur loc și, dacă acolo e ocupat, renunță
 * la ea. `text-variable-anchor` îi dă patru poziții de încercat înainte să se
 * dea bătut, iar `text-optional` lasă iconița pe hartă chiar dacă numele nu mai
 * încape nicăieri. `text-anchor` trebuie scos: specificația nu-l acceptă
 * alături de ancora variabilă, iar stilul de bază îl pune pe toate straturile.
 */
const DENSE_LABEL = {
  "text-variable-anchor": ["top", "bottom", "left", "right"],
  // Ancora fixă și decalajul pe axe sunt amândouă incompatibile cu ancora
  // variabilă. Decalajul mai ales: stilul de bază îl dă pe o singură axă —
  // `[0, 0.6]` la magazine, `[0.9, 0]` la stații — iar pe direcțiile rămase
  // distanța ar fi zero, adică numele exact peste iconiță.
  "text-anchor": null,
  "text-offset": null,
  // O singură distanță, măsurată în direcția ancorei, deci egală în toate patru.
  "text-radial-offset": 0.9,
  "text-justify": "auto",
  "text-optional": true,
  "text-padding": 1,
  "icon-padding": 1,
  "symbol-sort-key": poiSortKey(),
};

const FONT_REGULAR = "Inter Regular";
const FONT_BOLD = "Inter Bold";
const FONT_ITALIC = "Inter Italic";

export const GENERATED_FONTS = [FONT_REGULAR, FONT_BOLD, FONT_ITALIC];

/**
 * Traducem tăietura cerută de stilul de bază în cea generată de noi: italicul
 * rămâne italic, îngroșatul rămâne îngroșat. Așa etichetele cad exact unde le
 * așază stilul oficial, doar cu literele noastre.
 */
function mappedFontStack(current: unknown): string[] {
  const requested = Array.isArray(current) ? current.join(" ") : "";
  if (/italic|oblique/i.test(requested)) return [FONT_ITALIC];
  if (/bold|black|heavy/i.test(requested)) return [FONT_BOLD];
  return [FONT_REGULAR];
}

/**
 * Numele de localitate au trei mărimi, nu o curbă.
 *
 * Măsurate pe referință la zoom 12: orașul mare 28px, orice altă localitate cu
 * statut de oraș sau comună 19px, satele 16px. Raportul dintre trepte, 1.47 și
 * 1.19, se păstrează la orice zoom — de asta treptele sunt scrise ca fracțiuni
 * din mărimea de bază, nu ca liste separate care ar putea să se depărteze.
 */
const TOWN_RATIO = 19 / 28;
const VILLAGE_RATIO = 16 / 28;

/**
 * Curba de zoom a orașului mare. Restul localităților o folosesc pe aceeași,
 * înmulțită cu raportul lor, deci toate cresc și scad împreună.
 */
const PLACE_ZOOM_CURVE: [number, number][] = [
  [6, 13],
  [10, 21],
  [12, 28],
  [15, 32],
];

/**
 * `city` acoperă și orașul mare, și orașele mici din jur: în datele de peste
 * Brașov, Brașovul are `rank` 7, iar Săcele și Codlea au 11. Peste prag, numele
 * coboară la mărimea unui oraș obișnuit — în referință, Săcele și Ghimbav se
 * scriu la fel, deși unul e municipiu și celălalt oraș mic.
 */
const BIG_CITY_MAX_RANK = 8;

function placeTextSize(ratio: number, byRank = false): unknown {
  const at = (size: number): unknown => {
    const scaled = Math.round(size * ratio * 10) / 10;
    if (!byRank) return scaled;

    const asTown = Math.round(size * TOWN_RATIO * 10) / 10;
    return ["case", ["<=", ["coalesce", ["get", "rank"], 12], BIG_CITY_MAX_RANK], scaled, asTown];
  };

  // Zoom-ul trebuie să rămână expresia cea mai de sus — MapLibre nu îl acceptă
  // imbricat — deci alegerea după rang intră în fiecare rezultat, nu în afară.
  return [
    "interpolate",
    ["exponential", 1.2],
    ["zoom"],
    ...PLACE_ZOOM_CURVE.flatMap(([zoom, size]) => [zoom, at(size)]),
  ];
}

const line = (paint: LayerRule["paint"], test: RegExp): LayerRule => ({
  test,
  type: "line",
  paint,
});
const fill = (paint: LayerRule["paint"], test: RegExp): LayerRule => ({
  test,
  type: "fill",
  paint,
});
const label = (paint: LayerRule["paint"], test: RegExp): LayerRule => ({
  test,
  type: "symbol",
  paint,
});

/**
 * Regulile merg de la particular la general: contururile („casing") înaintea
 * umpluturilor, altfel `road_motorway_casing` ar fi prins de regula de motorway.
 */
const LAYER_RULES: LayerRule[] = [
  {
    test: /^background$/,
    type: "background",
    paint: (p) => ({ "background-color": p.background }),
  },
  {
    test: /^natural_earth$/,
    type: "raster",
    paint: (p) => ({ "raster-opacity": p.reliefOpacity }),
  },

  // Apă și cursuri de apă
  fill((p) => ({ "fill-color": p.water }), /^water$/),
  line((p) => ({ "line-color": p.waterway }), /^waterway_/),

  // Verdeață și teren
  fill(
    (p) => ({ "fill-color": p.park, "fill-opacity": 1, "fill-outline-color": p.park }),
    /^park$/,
  ),
  line((p) => ({ "line-color": p.wood }), /^park_outline$/),
  fill((p) => ({ "fill-color": p.wood, "fill-opacity": 1 }), /^landcover_wood$/),
  fill((p) => ({ "fill-color": p.grass, "fill-opacity": 1 }), /^landcover_grass$/),
  fill((p) => ({ "fill-color": p.wetland }), /^landcover_wetland$/),
  fill((p) => ({ "fill-color": p.sand }), /^landcover_sand$/),
  fill((p) => ({ "fill-color": p.ice }), /^landcover_ice$/),
  fill((p) => ({ "fill-color": p.residential }), /^landuse_residential$/),
  fill((p) => ({ "fill-color": p.pitch }), /^landuse_(pitch|track)$/),
  fill((p) => ({ "fill-color": p.institutional }), /^landuse_(cemetery|hospital|school)$/),
  fill((p) => ({ "fill-color": p.aeroway }), /^aeroway_fill$/),
  line((p) => ({ "line-color": p.minorCasing }), /^aeroway_(runway|taxiway)$/),

  // Clădiri. Stilul de bază le desenează plat doar între zoom 13 și 14, apoi le
  // lasă pe seama stratului ridicat — care la noi stă ascuns cât harta e plată.
  // Conturul fiecărei case rămâne deci vizibil la orice apropiere, ca pe OSM.
  {
    test: /^building$/,
    type: "fill",
    maxzoom: 24,
    paint: (p) => ({ "fill-color": p.building, "fill-outline-color": p.buildingOutline }),
  },
  {
    test: /^building-3d$/,
    type: "fill-extrusion",
    paint: (p) => ({ "fill-extrusion-color": p.building3d }),
  },

  // Șine — înaintea drumurilor, altfel `road_major_rail` cade pe regula de drum
  line((p) => ({ "line-color": p.rail }), /rail(_hatching)?$/),

  // Contururile drumurilor
  line((p) => ({ "line-color": p.motorwayCasing }), /motorway(_link)?_casing$/),
  line((p) => ({ "line-color": p.majorCasing }), /(trunk_primary|secondary_tertiary)_casing$/),
  line((p) => ({ "line-color": p.path }), /path_pedestrian_casing$/),
  line((p) => ({ "line-color": p.minorCasing }), /_casing$/),

  // Umplutura drumurilor
  line((p) => ({ "line-color": p.motorway }), /motorway(_link)?$/),
  line((p) => ({ "line-color": p.major }), /(trunk_primary|secondary_tertiary)$/),
  line((p) => ({ "line-color": p.path }), /path_pedestrian$/),
  line((p) => ({ "line-color": p.minor }), /(link|minor|street|service_track)$/),
  fill((p) => ({ "fill-color": p.minor }), /^road_area_pattern$/),

  // Granițe
  line((p) => ({ "line-color": p.boundary }), /^boundary_/),

  // Etichete de apă
  label(
    (p) => ({ "text-color": p.waterLabel, "text-halo-color": p.labelHalo }),
    /^(water_name_|waterway_line_label$)/,
  ),

  // Puncte de interes. Apar cu o treaptă de zoom mai devreme decât în stilul de
  // bază: o sesizare se citește după magazinul de lângă ea, deci vrem magazinele.
  {
    test: /^poi_transit$/,
    type: "symbol",
    paint: (p) => ({ "text-color": p.transitLabel, "text-halo-color": p.labelHalo }),
  },
  // Zoom-urile rămân cele ale stilului oficial — 15, 16, 17. Coborâte cu două
  // trepte, magazinele mici umpleau harta la depărtare, unde nu ajută pe nimeni.
  {
    test: /^poi_(r1|r7|r20)$/,
    type: "symbol",
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
    layout: () => DENSE_LABEL,
  },
  // Numele străzilor mici apar odată cu strada, nu cu două trepte mai târziu.
  {
    test: /^highway-name-minor$/,
    type: "symbol",
    minzoom: 14,
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
  },
  label(
    (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
    /^(airport$|highway-name-)/,
  ),

  // Localități. Mărimile sunt măsurate pe referință la zoom 12: orașul mare la
  // 30px, un oraș obișnuit sau un sat mare la 17-19px, toate îngroșate.
  {
    test: /^label_city/,
    type: "symbol",
    maxzoom: 16,
    paint: (p) => ({
      "text-color": p.label,
      "text-halo-color": p.labelHalo,
      "text-halo-width": 1.6,
      "text-halo-blur": 0.4,
    }),
    layout: () => ({
      "text-font": [FONT_BOLD],
      "text-size": placeTextSize(1, true),
      "text-letter-spacing": 0.01,
      "text-padding": 6,
    }),
  },
  {
    test: /^label_town$/,
    type: "symbol",
    maxzoom: 16,
    paint: (p) => ({
      "text-color": p.label,
      "text-halo-color": p.labelHalo,
      "text-halo-width": 1.5,
      "text-halo-blur": 0.4,
    }),
    layout: () => ({
      "text-font": [FONT_BOLD],
      "text-size": placeTextSize(TOWN_RATIO),
      "text-padding": 5,
    }),
  },
  {
    test: /^label_village$/,
    type: "symbol",
    maxzoom: 17,
    paint: (p) => ({
      "text-color": p.label,
      "text-halo-color": p.labelHalo,
      "text-halo-width": 1.4,
      "text-halo-blur": 0.4,
    }),
    layout: () => ({
      "text-font": [FONT_BOLD],
      "text-size": placeTextSize(VILLAGE_RATIO),
      "text-padding": 4,
    }),
  },
  label((p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }), /^label_other$/),
  label((p) => ({ "text-color": p.label, "text-halo-color": p.labelHalo }), /^label_/),
];

/** Straturile ridicate în 3D, ascunse cât timp harta e plată. */
export const BUILDING_3D_LAYER = "building-3d";

/**
 * Numerele de casă, ca pe OSM: stilul de bază nu le desenează, dalele le au.
 * Apar când ești pe stradă, mici și stinse, ca să nu concureze cu numele.
 */
export const HOUSE_NUMBER_LAYER = "housenumber";

function houseNumberLayer(source: string, palette: MapPalette): LayerSpecification {
  return {
    id: HOUSE_NUMBER_LAYER,
    type: "symbol",
    source,
    "source-layer": "housenumber",
    minzoom: 16,
    layout: {
      "text-field": ["get", "housenumber"],
      "text-font": [FONT_REGULAR],
      "text-size": ["interpolate", ["linear"], ["zoom"], 16, 9, 19, 11],
      "text-padding": 2,
      "text-max-width": 6,
    },
    paint: {
      "text-color": palette.labelMuted,
      "text-halo-color": palette.labelHalo,
      "text-halo-width": 0.8,
    },
  };
}

function ruleFor(layerId: string, layerType: LayerType): LayerRule | undefined {
  return LAYER_RULES.find(
    (candidate) => candidate.type === layerType && candidate.test.test(layerId),
  );
}

function vectorSourceOf(style: StyleSpecification): string | undefined {
  return Object.entries(style.sources).find(([, source]) => source.type === "vector")?.[0];
}

type ThemeOptions = {
  /** Modul 3D e pornit; la schimbarea temei clădirile trebuie să rămână ridicate. */
  buildings3d?: boolean;
};

/**
 * Întoarce o copie a stilului cu tema noastră aplicată. Nu mutăm stilul primit:
 * îl ținem în cache și îl recompunem la fiecare schimbare de temă.
 */
export function applyMapTheme(
  style: StyleSpecification,
  palette: MapPalette,
  { buildings3d = false }: ThemeOptions = {},
): StyleSpecification {
  const vectorSource = vectorSourceOf(style);

  const layers = style.layers.map((layer) => {
    const rule = ruleFor(layer.id, layer.type);
    const isLabel = layer.type === "symbol";
    if (!rule && !isLabel) return layer;

    const currentLayout: Record<string, unknown> | undefined =
      "layout" in layer ? layer.layout : undefined;
    const merged: Record<string, unknown> = {
      ...currentLayout,
      ...(isLabel ? { "text-font": mappedFontStack(currentLayout?.["text-font"]) } : {}),
      ...rule?.layout?.(),
      ...(layer.id === BUILDING_3D_LAYER
        ? { visibility: (buildings3d ? "visible" : "none") as "visible" | "none" }
        : {}),
    };
    // `null` înseamnă „scoate cheia": unele proprietăți se exclud reciproc, iar
    // stilul de bază le pune pe cele pe care noi le înlocuim.
    const layout = Object.fromEntries(Object.entries(merged).filter(([, value]) => value !== null));

    const paintPatch = rule?.paint && !palette.keepUpstreamPaint ? rule.paint(palette) : {};
    const hasPaint = "paint" in layer || Object.keys(paintPatch).length > 0;

    return {
      ...layer,
      ...(Object.keys(layout).length > 0 ? { layout } : {}),
      ...(rule?.minzoom !== undefined ? { minzoom: rule.minzoom } : {}),
      ...(rule?.maxzoom !== undefined ? { maxzoom: rule.maxzoom } : {}),
      ...(hasPaint
        ? { paint: { ...("paint" in layer ? layer.paint : undefined), ...paintPatch } }
        : {}),
    } as (typeof style.layers)[number];
  });

  if (vectorSource) layers.push(houseNumberLayer(vectorSource, palette));

  return { ...style, glyphs: GLYPHS_URL, layers };
}
