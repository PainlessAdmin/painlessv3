# Extras Oldalak Kód Audit

**Dátum:** 2025-12-03
**Auditor:** Claude Code
**Verzió:** 1.0
**Érintett fájlok:** Step10ExtrasGateway.tsx, Step10aPacking.tsx, Step10bDisassembly.tsx, Step10cCleaning.tsx, Step10dStorage.tsx, calculator-store.ts, calculator-logic.ts, calculator-config.ts

---

## 1. Összefoglaló

Az extras oldalak implementációja összességében jó minőségű, professzionális kód. A komponensek következetes felépítésűek, a TypeScript típusok megfelelően vannak definiálva, és a kód karbantartható. Ugyanakkor találtam néhány hibát, optimalizálási lehetőséget és biztonsági kérdést, amelyeket az alábbiakban részletezek.

---

## 2. Talált Hibák (Bugs)

### 2.1 KRITIKUS: Step10aPacking.tsx - Kötelező választás validáció hiánya

**Fájl:** `src/components/calculator/steps/Step10aPacking.tsx:57-62`

```typescript
const handleContinue = () => {
  if (selectedTier) {
    setPackingTier(selectedTier);
  }
  nextStep(); // PROBLÉMA: Akkor is továbblép, ha nincs kiválasztva semmi!
};
```

**Probléma:** A `handleContinue` függvény mindig meghívja a `nextStep()`-et, még akkor is, ha `selectedTier` null. Bár a gomb `canGoNext={isValid}` miatt le van tiltva, billentyűzettel vagy programozottan megkerülhető.

**Javítás:**
```typescript
const handleContinue = () => {
  if (!selectedTier) return;
  setPackingTier(selectedTier);
  nextStep();
};
```

---

### 2.2 KÖZEPES: Step10dStorage.tsx - `getWeeks` visszatérési érték inkonzisztencia

**Fájl:** `src/components/calculator/steps/Step10dStorage.tsx:68-71`

```typescript
const getWeeks = (duration: DurationValue): number => {
  if (duration === 'other') return 4; // Default to 1 month
  return duration;
};
```

**Probléma:** Ha a felhasználó "Other / I don't know"-t választ, a rendszer alapértelmezetten 4 hetet állít be, de a felhasználó ezt nem látja. Ez félrevezető lehet az árajánlatban.

**Javítás:** Jelezni kellene a felhasználónak, hogy egyedi időtartamhoz vegye fel a kapcsolatot.

---

### 2.3 KÖZEPES: Step10bDisassembly.tsx - Nem szinkronizálja a store-t mountoláskor

**Fájl:** `src/components/calculator/steps/Step10bDisassembly.tsx:60-67`

```typescript
const [items, setItems] = useState<Map<AssemblyComplexity, number>>(() => {
  const map = new Map<AssemblyComplexity, number>();
  for (const item of state.extras.disassemblyItems || []) {
    map.set(item.category, item.quantity);
  }
  return map;
});
// Nincs useEffect a szinkronizáláshoz!
```

**Probléma:** Más oldalakkal ellentétben itt nincs `useEffect` a store változásainak követésére. Ha a store állapota megváltozik kívülről (pl. localStorage betöltés), a komponens nem frissül.

**Javítás:** Adjunk hozzá egy `useEffect`-et:
```typescript
useEffect(() => {
  const map = new Map<AssemblyComplexity, number>();
  for (const item of state.extras.disassemblyItems || []) {
    map.set(item.category, item.quantity);
  }
  setItems(map);
}, [state.extras.disassemblyItems]);
```

---

### 2.4 ALACSONY: calculator-logic.ts - Típuskonverziós hiba

**Fájl:** `src/lib/calculator-logic.ts:363-368`

```typescript
if ('packingTier' in extras && extras.packingTier) {
  const sizeCategory = getPackingSizeCategory(cubes);
  const tierConfig = CALCULATOR_CONFIG.packingTiers[extras.packingTier as keyof typeof CALCULATOR_CONFIG.packingTiers];
```

**Probléma:** A `extras.packingTier` típuskonverziója nem biztonságos. Ha rossz érték kerül bele, runtime hiba keletkezhet.

**Javítás:**
```typescript
if ('packingTier' in extras && extras.packingTier &&
    extras.packingTier in CALCULATOR_CONFIG.packingTiers) {
  // ...
}
```

---

### 2.5 ALACSONY: Step10cCleaning.tsx - 6 szoba maximum nem ellenőrzött

**Fájl:** `src/lib/calculator-logic.ts:377`

```typescript
const roomKey = Math.min(extras.cleaningRooms, 6) as 1 | 2 | 3 | 4 | 5 | 6;
```

**Probléma:** A `Math.min` nem garantálja, hogy a szám 1 és 6 között lesz. Ha `cleaningRooms` 0 vagy negatív, hibás lookup történik.

**Javítás:**
```typescript
const roomKey = Math.max(1, Math.min(extras.cleaningRooms, 6)) as 1 | 2 | 3 | 4 | 5 | 6;
```

---

## 3. Optimalizálási Problémák

### 3.1 Ismétlődő `formatPrice` függvények

**Érintett fájlok:** Step10aPacking.tsx:32-38, Step10bDisassembly.tsx:49-55, Step10cCleaning.tsx:25-31, Step10dStorage.tsx:24-30

**Probléma:** Minden komponens saját `formatPrice` függvényt definiál, ami pontosan ugyanazt csinálja.

**Javítás:** Központosított utility függvénybe kéne kivinni:
```typescript
// src/lib/utils/format.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(price);
}
```

**Hatás:** ~20 sor duplikáció csökkentése

---

### 3.2 Ismétlődő `getPackingSizeCategory` függvény

**Fájl:** Step10aPacking.tsx:24-29 és calculator-logic.ts:349-354

**Probléma:** A függvény két helyen van definiálva.

**Javítás:** Exportálni a `calculator-logic.ts`-ból és importálni a komponensbe.

---

### 3.3 Map vs Object használata a Step10bDisassembly-ben

**Fájl:** `src/components/calculator/steps/Step10bDisassembly.tsx:61`

**Probléma:** A `Map<AssemblyComplexity, number>` használata bonyolultabbá teszi a kódot, és nem igazán szükséges. A Map-et aztán Array-re kell konvertálni a store-ba mentéshez.

**Javítás:** Egyszerű object használata:
```typescript
const [items, setItems] = useState<Record<AssemblyComplexity, number>>({});
```

---

### 3.4 CALCULATOR_CONFIG.packingTiers típuskonverzió

**Fájl:** Step10aPacking.tsx:90

```typescript
{(Object.entries(CALCULATOR_CONFIG.packingTiers) as [PackingTier, typeof CALCULATOR_CONFIG.packingTiers.materials][]).map(
```

**Probléma:** A típuskonverzió túl bonyolult és nehezen olvasható.

**Javítás:** Definiálni egy segéd típust a config fájlban:
```typescript
export type PackingTierConfig = typeof CALCULATOR_CONFIG.packingTiers[keyof typeof CALCULATOR_CONFIG.packingTiers];
```

---

### 3.5 SVG-k inline kezelése

**Fájl:** Minden Step10*.tsx fájl

**Probléma:** A checkmark SVG-k minden komponensben inline vannak definiálva (~10 sor × 5 komponens).

**Javítás:** Létrehozni egy `CheckIcon` komponenst:
```typescript
// src/components/icons/CheckIcon.tsx
export const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
```

---

### 3.6 Felesleges re-renderek

**Fájl:** Minden Step10*.tsx

**Probléma:** A `useStore(calculatorStore)` a teljes store-t figyeli, ami felesleges re-rendereket okozhat.

**Javítás:** Szelektív store olvasás:
```typescript
// Csak a szükséges értékeket olvassuk ki
const gateway = useStore(calculatorStore, state => state.extras.gateway);
```

Megjegyzés: A nanostores `useStore` hook alapból így működik, de explicit szelektorok használata jobb performance-ot eredményez.

---

## 4. Biztonsági Észrevételek

### 4.1 ALACSONY: localStorage XSS sebezhetőség

**Fájl:** `src/lib/calculator-store.ts:498-510`

```typescript
const saved = localStorage.getItem('painless-calculator-state');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    calculatorStore.set({ ...parsed, lastUpdatedAt: now });
```

**Probléma:** A localStorage-ból beolvasott adat validáció nélkül kerül a store-ba. Egy támadó módosíthatja a localStorage-t és káros adatokat injektálhat.

**Javítás:** Zod vagy más séma validáció használata:
```typescript
import { z } from 'zod';

const CalculatorStateSchema = z.object({
  currentStep: z.number().min(1).max(12),
  serviceType: z.enum(['home', 'office', 'clearance']).nullable(),
  // ... további mezők
});

const parsed = CalculatorStateSchema.safeParse(JSON.parse(saved));
if (parsed.success) {
  calculatorStore.set({ ...parsed.data, lastUpdatedAt: now });
}
```

---

### 4.2 ALACSONY: Nincs rate limiting a state mentéseken

**Fájl:** `src/lib/calculator-store.ts:532-539`

**Probléma:** Minden egyes változásnál azonnal localStorage-ba ment, ami nagy mennyiségű írást okozhat.

**Javítás:** Debounce használata:
```typescript
import { debounce } from '@/lib/utils';

const debouncedSaveState = debounce(() => {
  localStorage.setItem('painless-calculator-state', JSON.stringify(calculatorStore.get()));
}, 500);
```

---

### 4.3 INFO: URL param injection

**Fájl:** `src/lib/calculator-store.ts:516-521`

```typescript
calculatorStore.setKey('gclid', params.get('gclid'));
calculatorStore.setKey('utmSource', params.get('utm_source'));
```

**Megjegyzés:** Az URL paraméterek validáció nélkül kerülnek a store-ba. Ez nem közvetlen biztonsági kockázat, de ha ezek az adatok backend-re kerülnek, érdemes sanitizálni őket.

---

## 5. Kód Minőség Elemzés

### 5.1 Pozitívumok

1. **Konzisztens kódstílus** - Minden komponens hasonló struktúrát követ
2. **TypeScript típusok** - Megfelelően definiált típusok mindenhol
3. **Accessibility** - `role`, `aria-checked`, `tabIndex` használata
4. **Tailwind CSS** - Jól szervezett, újrahasználható stílusok
5. **Separation of Concerns** - UI és logika megfelelően szétválasztva
6. **Error handling** - Try-catch blokkok a kritikus helyeken

### 5.2 Javítandók

1. **Duplikált kód** - formatPrice, getPackingSizeCategory
2. **Magic numbers** - pl. 8 (storage discount weeks), 6 (max rooms)
3. **Hiányzó JSDoc** - Néhány komplexebb függvény dokumentálatlan
4. **Test coverage** - Nem láttam unit testeket az új komponensekhez

---

## 6. Teljesítmény Elemzés

### 6.1 Bundle méret hatás

- 5 új komponens: ~1500 sor TypeScript
- Becsült gzip méret: ~15-20KB
- **Értékelés:** Elfogadható

### 6.2 Runtime teljesítmény

- Map/Array konverziók minden renderben
- Teljes store subscription minden komponensben
- Inline függvények a JSX-ben
- **Értékelés:** Optimalizálható, de nem kritikus

### 6.3 Első betöltés

- Lazy loading nincs implementálva az extras oldalakhoz
- **Javítás:** `React.lazy()` használata

---

## 7. Összesített Értékelések

| Kategória | Pontszám | Megjegyzés |
|-----------|----------|------------|
| **Kód Minőség** | 78/100 | Jó struktúra, de van duplikáció |
| **Teljesítmény** | 72/100 | Optimalizálható re-renderek |
| **Stabilitás** | 82/100 | Jó hibakezelés, néhány edge case |
| **Biztonság** | 85/100 | Alapvetően biztonságos, minor javítások |

### Összesített pontszám: **79/100**

---

## 8. Prioritás szerinti javítási lista

### Magas prioritás (1 héten belül)
1. [ ] Step10aPacking handleContinue early return javítása
2. [ ] Step10bDisassembly useEffect hozzáadása a szinkronizáláshoz
3. [ ] cleaningRooms validáció javítása (min 1)

### Közepes prioritás (2 héten belül)
4. [ ] formatPrice utility függvény kiemelése
5. [ ] getPackingSizeCategory centralizálása
6. [ ] CheckIcon komponens létrehozása

### Alacsony prioritás (1 hónapon belül)
7. [ ] Magic numbers konstansokká alakítása
8. [ ] localStorage validáció Zod-dal
9. [ ] saveState debounce implementálása
10. [ ] Unit tesztek írása az új komponensekhez
11. [ ] React.lazy() implementálása az extras oldalakhoz

---

## 9. Tesztelési javaslatok

### Unit tesztek
```typescript
// Step10aPacking.test.tsx
describe('Step10aPacking', () => {
  it('should not allow continue without selection', () => {});
  it('should show correct prices for each size category', () => {});
  it('should sync with store on mount', () => {});
});

// calculator-logic.test.ts
describe('getExtrasCost', () => {
  it('should calculate packing tier cost correctly', () => {});
  it('should apply 50% storage discount for first 8 weeks', () => {});
  it('should handle both new and legacy data structures', () => {});
});
```

### E2E tesztek
```typescript
// extras-flow.spec.ts
describe('Extras Flow', () => {
  it('should navigate through all selected extras pages', () => {});
  it('should persist selections across page navigation', () => {});
  it('should calculate total correctly with all extras', () => {});
});
```

---

## 10. Következtetés

Az extras oldalak implementációja professzionális szintű, jól strukturált kód. A talált hibák javíthatók, és az optimalizálási javaslatok implementálása tovább javítaná a kód minőségét és teljesítményét.

A legfontosabb teendők:
1. A 3 kritikus/közepes hiba javítása
2. Duplikált kód eliminálása
3. Unit tesztek írása

---

**Audit készült:** 2025-12-03
**Következő felülvizsgálat javasolt:** 2025-01-03
