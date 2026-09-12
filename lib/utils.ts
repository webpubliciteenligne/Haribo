/**
 * Fusionne des classes Tailwind conditionnelles sans dépendance externe
 * (évite d'ajouter clsx/tailwind-merge juste pour ça — discipline "zéro JS inutile").
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
