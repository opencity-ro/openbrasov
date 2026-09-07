import { OpenLocationCode } from "open-location-code";

/**
 * Adresa unei sesizări, scrisă din locul ei de pe hartă.
 *
 * Nu cerem nimănui să scrie adresa de mână: omul pune un punct, iar textul iese
 * din punct. O adresă tastată e greșită des și în feluri care nu se văd — strada
 * scrisă altfel, numărul de la blocul de vizavi, un cartier care nu există.
 */

/** Orașul site-ului. Nu se scrie în adresă: fiecare sesizare e deja aici. */
export const HOME_CITY = "Brașov";

export type AddressKind = "street" | "landmark" | "code";

export type FormattedAddress = {
  label: string;
  kind: AddressKind;
};

/** Bucățile de adresă pe care le întoarce serviciul de geocodare. */
export type AddressParts = {
  road?: string;
  house_number?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  [key: string]: string | undefined;
};

export type ReversePlace = {
  /** Numele locului găsit, când are unul: un parc, o cabană, un lac. */
  name?: string | null;
  address?: AddressParts | null;
};

/**
 * Chei din care iese un reper cu nume, în ordinea în care le-am lua pe teren.
 * Un parc bate un teren de sport, care bate o clădire fără nume de stradă.
 */
const LANDMARK_KEYS = [
  "park",
  "leisure",
  "tourism",
  "attraction",
  "natural",
  "forest",
  "water",
  "amenity",
  "building",
  "shop",
  "man_made",
  "aeroway",
  "railway",
] as const;

/**
 * Locul de care ține punctul, de la cel mai mic la cel mai mare. Satul înaintea
 * orașului, fiindcă Poiana Brașov e trecută și ca sat, și ca parte din Brașov —
 * iar „Poiana Brașov" spune mult mai mult decât „Brașov".
 *
 * `municipality` lipsește dinadins: acolo scrie „Zona Metropolitană Brașov", o
 * împărțire administrativă pe care n-o rostește nimeni.
 */
const LOCALITY_KEYS = ["village", "hamlet", "town", "city"] as const;
const AREA_KEYS = ["neighbourhood", "suburb", "quarter", "city_district"] as const;

/**
 * Cheile care descriu un teritoriu întreg, nu un obiect anume. Ele rămân
 * adevărate oricât de departe ar fi lucrul găsit de serviciu — un cartier tot
 * cartier e — spre deosebire de stradă, număr sau nume de clădire.
 */
export const AREA_ONLY_KEYS = [...LOCALITY_KEYS, ...AREA_KEYS] as const;

const plusCodes = new OpenLocationCode();

const clean = (value: string | undefined | null): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const firstOf = (parts: AddressParts, keys: readonly string[]): string | undefined => {
  for (const key of keys) {
    const value = clean(parts[key]);
    if (value) return value;
  }
  return undefined;
};

/**
 * Codul locului, pentru punctele despre care harta nu are nimic de spus: un
 * luminiș, un drum forestier, mijlocul unui câmp.
 *
 * Codul e întreg, nu scurtat. Unul scurtat n-are înțeles fără numele localității
 * de lângă el, iar exact acolo unde ne trebuie codul nu există nicio localitate.
 */
export function plusCode(latitude: number, longitude: number): string {
  return plusCodes.encode(latitude, longitude);
}

/**
 * Adresa, scrisă cum ar spune-o un om.
 *
 * Orașul lipsește dinadins: toate sesizările sunt din același oraș, iar repetarea
 * lui la fiecare rând nu adaugă nimic. Numele localității apare doar când
 * sesizarea nu e în orașul nostru — atunci chiar contează că e la Râșnov.
 */
export function formatAddress(
  place: ReversePlace | null,
  latitude: number,
  longitude: number,
): FormattedAddress {
  const parts = place?.address ?? {};

  // Primul loc care nu e chiar orașul nostru: un sat de-al lui, o comună vecină.
  // Orașul se sare, fiindcă e același pentru toate sesizările.
  const elsewhere = LOCALITY_KEYS.map((key) => clean(parts[key])).find(
    (value) => value && value !== HOME_CITY,
  );
  // Când punctul e chiar în oraș, rămâne cartierul, care spune ceva.
  const area = elsewhere ?? firstOf(parts, AREA_KEYS);

  const street = clean(parts.road) ?? clean(parts.pedestrian) ?? clean(parts.footway);
  if (street) {
    const number = clean(parts.house_number);
    const head = number ? `${street}, nr. ${number}` : street;
    return { label: area ? `${head}, ${area}` : head, kind: "street" };
  }

  const landmark = clean(place?.name) ?? firstOf(parts, LANDMARK_KEYS);
  if (landmark) {
    return { label: area ? `Lângă ${landmark}, ${area}` : `Lângă ${landmark}`, kind: "landmark" };
  }

  // Codul locului nu spune nimic omului care se uită la el, dar cartierul da.
  // Împreună, măcar știi în ce parte a orașului cauți.
  const code = plusCode(latitude, longitude);
  return { label: area ? `${code}, ${area}` : code, kind: "code" };
}
