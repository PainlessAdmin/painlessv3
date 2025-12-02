/**
 * STEP 10: EXTRAS
 *
 * Optional add-on services:
 * - Packing (based on cubes)
 * - Cleaning (by room count)
 * - Storage (by size)
 * - Assembly/Disassembly (items with quantity)
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  calculatedCubes,
  setExtras,
  addAssemblyItem,
  removeAssemblyItem,
  nextStep,
  prevStep,
  type ExtrasData,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG, type PackingSize } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Storage option type
type StorageKey = keyof typeof CALCULATOR_CONFIG.storage;
type AssemblyKey = keyof typeof CALCULATOR_CONFIG.assembly;

export function Step10Extras() {
  const state = useStore(calculatorStore);
  const cubes = useStore(calculatedCubes);

  // Local state for extras
  const [packing, setPacking] = useState<PackingSize | ''>(state.extras.packing || '');
  const [cleaningRooms, setCleaningRooms] = useState<number | ''>(state.extras.cleaningRooms || '');
  const [storage, setStorage] = useState<StorageKey | ''>(state.extras.storage || '');
  const [assemblyItems, setAssemblyItems] = useState<ExtrasData['assembly']>(
    state.extras.assembly || []
  );

  // For adding new assembly items
  const [newAssemblyType, setNewAssemblyType] = useState<AssemblyKey | ''>('');
  const [newAssemblyQty, setNewAssemblyQty] = useState(1);

  // Calculate totals
  const packingTotal = packing ? CALCULATOR_CONFIG.packing[packing].total : 0;
  const cleaningTotal = cleaningRooms ? CALCULATOR_CONFIG.cleaning[cleaningRooms].price : 0;
  const storageTotal = storage ? CALCULATOR_CONFIG.storage[storage].price : 0;
  const assemblyTotal = assemblyItems.reduce((sum, item) => {
    return sum + CALCULATOR_CONFIG.assembly[item.type].price * item.quantity;
  }, 0);
  const extrasTotal = packingTotal + cleaningTotal + storageTotal + assemblyTotal;

  // Get available packing options based on cubes
  const getAvailablePackingOptions = () => {
    const options: Array<{ value: PackingSize; label: string; price: number }> = [];

    // Fragile only always available
    options.push({
      value: 'fragileOnly',
      label: CALCULATOR_CONFIG.packing.fragileOnly.label,
      price: CALCULATOR_CONFIG.packing.fragileOnly.total,
    });

    // Size-based options
    const packingKeys: PackingSize[] = ['small', 'medium', 'large', 'xl'];
    for (const key of packingKeys) {
      const opt = CALCULATOR_CONFIG.packing[key];
      if (cubes >= opt.cubesMin && cubes <= opt.cubesMax) {
        options.push({
          value: key,
          label: opt.label,
          price: opt.total,
        });
      }
    }

    return options;
  };

  // Handle adding assembly item
  const handleAddAssembly = () => {
    if (!newAssemblyType || newAssemblyQty < 1) return;

    const existing = assemblyItems.findIndex(item => item.type === newAssemblyType);
    if (existing >= 0) {
      // Update quantity
      const updated = [...assemblyItems];
      updated[existing].quantity += newAssemblyQty;
      setAssemblyItems(updated);
    } else {
      setAssemblyItems([...assemblyItems, { type: newAssemblyType, quantity: newAssemblyQty }]);
    }

    setNewAssemblyType('');
    setNewAssemblyQty(1);
  };

  // Handle removing assembly item
  const handleRemoveAssembly = (type: AssemblyKey) => {
    setAssemblyItems(assemblyItems.filter(item => item.type !== type));
  };

  // Handle continue
  const handleContinue = () => {
    // Save to store
    setExtras({
      packing: packing || undefined,
      cleaningRooms: cleaningRooms || undefined,
      storage: storage || undefined,
      assembly: assemblyItems,
    });

    nextStep();
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Would you like any extra services?
        </h2>
        <p className="text-muted-foreground mt-2">
          All optional - skip if you don't need them
        </p>
      </div>

      {/* Packing Service */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <div>
              <h3 className="font-medium text-foreground">Packing Service</h3>
              <p className="text-sm text-muted-foreground">
                Professional packing by our team
              </p>
            </div>
          </div>
          {packingTotal > 0 && (
            <span className="font-semibold text-primary">
              {formatPrice(packingTotal)}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="packing">Select packing option</Label>
          <Select
            id="packing"
            value={packing}
            onChange={(e) => setPacking(e.target.value as PackingSize | '')}
          >
            <option value="">No packing needed</option>
            {getAvailablePackingOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} - {formatPrice(opt.price)}
              </option>
            ))}
          </Select>
        </div>

        {packing && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            Includes materials and labour. Our team will pack your belongings
            {packing === 'fragileOnly' ? ' (fragile items only)' : ' the day before your move'}.
          </div>
        )}
      </Card>

      {/* Cleaning Service */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧹</span>
            <div>
              <h3 className="font-medium text-foreground">End of Tenancy Cleaning</h3>
              <p className="text-sm text-muted-foreground">
                Professional deep clean after you move out
              </p>
            </div>
          </div>
          {cleaningTotal > 0 && (
            <span className="font-semibold text-primary">
              {formatPrice(cleaningTotal)}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cleaning">Number of rooms</Label>
          <Select
            id="cleaning"
            value={cleaningRooms}
            onChange={(e) => setCleaningRooms(e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">No cleaning needed</option>
            {Object.entries(CALCULATOR_CONFIG.cleaning).map(([rooms, data]) => (
              <option key={rooms} value={rooms}>
                {data.label} - {formatPrice(data.price)}
              </option>
            ))}
          </Select>
        </div>

        {cleaningRooms && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            Professional cleaning to help get your deposit back. Includes kitchen, bathrooms, and all rooms.
          </div>
        )}
      </Card>

      {/* Storage Service */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <div>
              <h3 className="font-medium text-foreground">Storage</h3>
              <p className="text-sm text-muted-foreground">
                Secure storage per month
              </p>
            </div>
          </div>
          {storageTotal > 0 && (
            <span className="font-semibold text-primary">
              {formatPrice(storageTotal)}/month
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="storage">Storage size</Label>
          <Select
            id="storage"
            value={storage}
            onChange={(e) => setStorage(e.target.value as StorageKey | '')}
          >
            <option value="">No storage needed</option>
            {Object.entries(CALCULATOR_CONFIG.storage).map(([key, data]) => (
              <option key={key} value={key}>
                {data.label} - {formatPrice(data.price)}/month
              </option>
            ))}
          </Select>
        </div>

        {storage && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            Secure, climate-controlled storage. First month included with your move. Cancel anytime with 7 days notice.
          </div>
        )}
      </Card>

      {/* Assembly Service */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <div>
              <h3 className="font-medium text-foreground">Furniture Assembly</h3>
              <p className="text-sm text-muted-foreground">
                Disassembly & reassembly at destination
              </p>
            </div>
          </div>
          {assemblyTotal > 0 && (
            <span className="font-semibold text-primary">
              {formatPrice(assemblyTotal)}
            </span>
          )}
        </div>

        {/* Add assembly item */}
        <div className="grid gap-2 sm:grid-cols-[1fr_80px_auto]">
          <div className="space-y-1">
            <Label htmlFor="assembly-type" className="text-xs">Item type</Label>
            <Select
              id="assembly-type"
              value={newAssemblyType}
              onChange={(e) => setNewAssemblyType(e.target.value as AssemblyKey | '')}
            >
              <option value="">Select item type...</option>
              {Object.entries(CALCULATOR_CONFIG.assembly).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.label} ({data.examples}) - {formatPrice(data.price)}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="assembly-qty" className="text-xs">Qty</Label>
            <Input
              id="assembly-qty"
              type="number"
              min={1}
              max={20}
              value={newAssemblyQty}
              onChange={(e) => setNewAssemblyQty(parseInt(e.target.value) || 1)}
              className="text-center"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAssembly}
              disabled={!newAssemblyType}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Assembly items list */}
        {assemblyItems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Items to assemble:</Label>
            <div className="space-y-2">
              {assemblyItems.map((item) => {
                const config = CALCULATOR_CONFIG.assembly[item.type];
                const itemTotal = config.price * item.quantity;
                return (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.quantity}×</span>
                      <span className="text-sm">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatPrice(itemTotal)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssembly(item.type)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {assemblyItems.length === 0 && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            Add items that need disassembly before the move and reassembly at your new home.
          </div>
        )}
      </Card>

      {/* Extras Total */}
      {extrasTotal > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Extras Total</h3>
              <p className="text-sm text-muted-foreground">
                Added to your moving quote
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(extrasTotal)}
            </span>
          </div>

          {/* Breakdown */}
          <div className="mt-3 pt-3 border-t border-primary/10 space-y-1 text-sm">
            {packingTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Packing</span>
                <span>{formatPrice(packingTotal)}</span>
              </div>
            )}
            {cleaningTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Cleaning</span>
                <span>{formatPrice(cleaningTotal)}</span>
              </div>
            )}
            {storageTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Storage (1st month)</span>
                <span>{formatPrice(storageTotal)}</span>
              </div>
            )}
            {assemblyTotal > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Assembly ({assemblyItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatPrice(assemblyTotal)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        nextLabel={extrasTotal > 0 ? 'Continue with Extras' : 'Skip Extras'}
      />
    </div>
  );
}

export default Step10Extras;
