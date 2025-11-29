/**
 * STEP 10: EXTRAS
 *
 * Optional add-on services:
 * - Packing (based on cubes)
 * - Cleaning (by room count)
 * - Storage (by size)
 * - Assembly/Disassembly (items with quantity)
 *
 * Enhanced with image cards and refined styling.
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  calculatedCubes,
  setExtras,
  nextStep,
  prevStep,
  type ExtrasData,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG, type PackingSize } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

// Storage option type
type StorageKey = keyof typeof CALCULATOR_CONFIG.storage;
type AssemblyKey = keyof typeof CALCULATOR_CONFIG.assembly;

// Service card config
const serviceCards = [
  { key: 'packing', icon: '📦', color: 'bg-purple-500', label: 'Packing', desc: 'Professional packing' },
  { key: 'cleaning', icon: '🧹', color: 'bg-blue-500', label: 'Cleaning', desc: 'End of tenancy' },
  { key: 'storage', icon: '🏠', color: 'bg-green-500', label: 'Storage', desc: 'Secure monthly' },
  { key: 'assembly', icon: '🔧', color: 'bg-amber-500', label: 'Assembly', desc: 'Furniture build' },
];

export function Step10Extras() {
  const state = useStore(calculatorStore);
  const cubes = useStore(calculatedCubes);

  // Active service sections
  const [activeService, setActiveService] = useState<string | null>(null);

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
    setExtras({
      packing: packing || undefined,
      cleaningRooms: cleaningRooms || undefined,
      storage: storage || undefined,
      assembly: assemblyItems,
    });
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Check if service has selection
  const hasSelection = (key: string) => {
    switch (key) {
      case 'packing': return !!packing;
      case 'cleaning': return !!cleaningRooms;
      case 'storage': return !!storage;
      case 'assembly': return assemblyItems.length > 0;
      default: return false;
    }
  };

  return (
    <div className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          Need any extra services?
        </h1>
        <p className="text-muted-foreground mt-2">
          All optional - skip if you don't need them
        </p>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {serviceCards.map((service) => {
          const selected = hasSelection(service.key);
          const isActive = activeService === service.key;

          return (
            <button
              key={service.key}
              type="button"
              onClick={() => setActiveService(isActive ? null : service.key)}
              className={cn(
                'relative p-4 rounded-2xl text-center transition-all duration-300 border-2',
                'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50',
                isActive && 'border-primary shadow-lg',
                selected && !isActive && 'border-emerald-400 bg-emerald-50',
                !isActive && !selected && 'border-transparent bg-gray-100'
              )}
            >
              <div className={cn(
                'w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl text-white mb-2',
                service.color
              )}>
                {service.icon}
              </div>
              <h3 className="font-semibold text-foreground">{service.label}</h3>
              <p className="text-xs text-muted-foreground">{service.desc}</p>

              {/* Selected indicator */}
              {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Service Detail Panels */}
      {activeService === 'packing' && (
        <Card className="p-6 bg-white shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-2xl text-white">📦</div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Packing Service</h3>
              <p className="text-sm text-muted-foreground">Professional packing by our team</p>
            </div>
            {packingTotal > 0 && (
              <span className="ml-auto font-bold text-lg text-primary">{formatPrice(packingTotal)}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="packing">Select packing option</Label>
            <Select
              id="packing"
              value={packing}
              onChange={(e) => setPacking(e.target.value as PackingSize | '')}
              className="py-3"
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
            <div className="mt-3 text-sm text-muted-foreground bg-purple-50 p-3 rounded-lg">
              Includes materials and labour. Our team will pack your belongings
              {packing === 'fragileOnly' ? ' (fragile items only)' : ' the day before your move'}.
            </div>
          )}
        </Card>
      )}

      {activeService === 'cleaning' && (
        <Card className="p-6 bg-white shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-2xl text-white">🧹</div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">End of Tenancy Cleaning</h3>
              <p className="text-sm text-muted-foreground">Professional deep clean</p>
            </div>
            {cleaningTotal > 0 && (
              <span className="ml-auto font-bold text-lg text-primary">{formatPrice(cleaningTotal)}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleaning">Number of rooms</Label>
            <Select
              id="cleaning"
              value={cleaningRooms}
              onChange={(e) => setCleaningRooms(e.target.value ? parseInt(e.target.value) : '')}
              className="py-3"
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
            <div className="mt-3 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              Professional cleaning to help get your deposit back. Includes kitchen, bathrooms, and all rooms.
            </div>
          )}
        </Card>
      )}

      {activeService === 'storage' && (
        <Card className="p-6 bg-white shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl text-white">🏠</div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Storage</h3>
              <p className="text-sm text-muted-foreground">Secure storage per month</p>
            </div>
            {storageTotal > 0 && (
              <span className="ml-auto font-bold text-lg text-primary">{formatPrice(storageTotal)}/mo</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage">Storage size</Label>
            <Select
              id="storage"
              value={storage}
              onChange={(e) => setStorage(e.target.value as StorageKey | '')}
              className="py-3"
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
            <div className="mt-3 text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
              Secure, climate-controlled storage. First month included with your move. Cancel anytime with 7 days notice.
            </div>
          )}
        </Card>
      )}

      {activeService === 'assembly' && (
        <Card className="p-6 bg-white shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl text-white">🔧</div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Furniture Assembly</h3>
              <p className="text-sm text-muted-foreground">Disassembly & reassembly</p>
            </div>
            {assemblyTotal > 0 && (
              <span className="ml-auto font-bold text-lg text-primary">{formatPrice(assemblyTotal)}</span>
            )}
          </div>

          {/* Add assembly item */}
          <div className="grid gap-3 sm:grid-cols-[1fr_80px_auto] items-end">
            <div className="space-y-1">
              <Label htmlFor="assembly-type" className="text-xs">Item type</Label>
              <Select
                id="assembly-type"
                value={newAssemblyType}
                onChange={(e) => setNewAssemblyType(e.target.value as AssemblyKey | '')}
                className="py-3"
              >
                <option value="">Select item...</option>
                {Object.entries(CALCULATOR_CONFIG.assembly).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.label} - {formatPrice(data.price)}
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
                className="text-center py-3"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddAssembly}
              disabled={!newAssemblyType}
              className="py-3"
            >
              Add
            </Button>
          </div>

          {/* Assembly items list */}
          {assemblyItems.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Items to assemble:</Label>
              {assemblyItems.map((item) => {
                const config = CALCULATOR_CONFIG.assembly[item.type];
                const itemTotal = config.price * item.quantity;
                return (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700">{item.quantity}×</span>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-amber-700">{formatPrice(itemTotal)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssembly(item.type)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {assemblyItems.length === 0 && (
            <div className="mt-3 text-sm text-muted-foreground bg-amber-50 p-3 rounded-lg">
              Add items that need disassembly before the move and reassembly at your new home.
            </div>
          )}
        </Card>
      )}

      {/* Extras Total */}
      {extrasTotal > 0 && (
        <Card className="p-5 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Extras Total</h3>
              <p className="text-sm text-muted-foreground">Added to your moving quote</p>
            </div>
            <span className="text-3xl font-bold text-primary">{formatPrice(extrasTotal)}</span>
          </div>

          {/* Breakdown */}
          <div className="mt-4 pt-4 border-t border-primary/20 grid gap-2 text-sm">
            {packingTotal > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><span className="text-purple-500">📦</span> Packing</span>
                <span className="font-medium">{formatPrice(packingTotal)}</span>
              </div>
            )}
            {cleaningTotal > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><span className="text-blue-500">🧹</span> Cleaning</span>
                <span className="font-medium">{formatPrice(cleaningTotal)}</span>
              </div>
            )}
            {storageTotal > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><span className="text-green-500">🏠</span> Storage (1st month)</span>
                <span className="font-medium">{formatPrice(storageTotal)}</span>
              </div>
            )}
            {assemblyTotal > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><span className="text-amber-500">🔧</span> Assembly ({assemblyItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium">{formatPrice(assemblyTotal)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel={extrasTotal > 0 ? 'Continue with Extras' : 'Skip Extras'}
      />
    </div>
  );
}

export default Step10Extras;
