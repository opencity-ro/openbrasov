/**
 * Pachetul oficial nu vine cu tipuri, iar noi îi folosim o singură metodă.
 * Declarăm doar atât cât atingem, ca semnătura să rămână verificată.
 */
declare module "open-location-code" {
  export class OpenLocationCode {
    /** Codul locului. Lungimea implicită dă un dreptunghi de circa 14 pe 14 metri. */
    encode(latitude: number, longitude: number, codeLength?: number): string;
  }
}
