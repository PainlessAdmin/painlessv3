/**
 * CALCULATOR CONFIGURATION
 *
 * Define calculator steps and flow
 */

import type { Step } from './types';

/**
 * Calculator steps configuration
 *
 * Customize this based on your calculator needs
 */
export const CALCULATOR_STEPS: Step[] = [
  {
    id: 'step-01',
    order: 1,
    title: {
      en: 'Service',
      es: 'Servicio',
      fr: 'Service',
    },
    description: {
      en: 'What type of removal service do you need?',
      es: '¿Qué tipo de servicio de mudanza necesitas?',
      fr: 'Quel type de service de déménagement avez-vous besoin?',
    },
    component: 'Step1ServiceType',
  },
  {
    id: 'step-02',
    order: 2,
    title: {
      en: 'Size',
      es: 'Tamaño',
      fr: 'Taille',
    },
    description: {
      en: 'Tell us about your property',
      es: 'Cuéntanos sobre tu propiedad',
      fr: 'Parlez-nous de votre propriété',
    },
    component: 'Step2PropertySize',
  },
  {
    id: 'step-03',
    order: 3,
    title: {
      en: 'Items',
      es: 'Objetos',
      fr: 'Objets',
    },
    description: {
      en: 'How much stuff do you have?',
      es: '¿Cuántas cosas tienes?',
      fr: 'Combien d\'affaires avez-vous?',
    },
    component: 'Step3BelongingsSlider',
  },
  {
    id: 'step-04',
    order: 4,
    title: {
      en: 'Plan',
      es: 'Plan',
      fr: 'Plan',
    },
    description: {
      en: 'Our recommended resources for your move',
      es: 'Nuestros recursos recomendados para tu mudanza',
      fr: 'Nos ressources recommandées pour votre déménagement',
    },
    component: 'Step4Recommendation',
  },
  {
    id: 'step-05',
    order: 5,
    title: {
      en: 'Date',
      es: 'Fecha',
      fr: 'Date',
    },
    description: {
      en: 'When would you like to move?',
      es: '¿Cuándo te gustaría mudarte?',
      fr: 'Quand souhaitez-vous déménager?',
    },
    component: 'Step5DateSelection',
  },
  {
    id: 'step-06',
    order: 6,
    title: {
      en: 'Access',
      es: 'Acceso',
      fr: 'Accès',
    },
    description: {
      en: 'Any access issues or special requirements?',
      es: '¿Algún problema de acceso o requisitos especiales?',
      fr: 'Des problèmes d\'accès ou des exigences particulières?',
    },
    component: 'Step6Complications',
  },
  {
    id: 'step-07',
    order: 7,
    title: {
      en: 'Chain',
      es: 'Cadena',
      fr: 'Chaîne',
    },
    description: {
      en: 'Are you part of a property chain?',
      es: '¿Eres parte de una cadena de propiedades?',
      fr: 'Faites-vous partie d\'une chaîne immobilière?',
    },
    component: 'Step7PropertyChain',
  },
  {
    id: 'step-08',
    order: 8,
    title: {
      en: 'From',
      es: 'Origen',
      fr: 'Départ',
    },
    description: {
      en: 'Where are you moving from?',
      es: '¿De dónde te mudas?',
      fr: 'D\'où déménagez-vous?',
    },
    component: 'Step8FromAddress',
  },
  {
    id: 'step-09',
    order: 9,
    title: {
      en: 'To',
      es: 'Destino',
      fr: 'Arrivée',
    },
    description: {
      en: 'Where are you moving to?',
      es: '¿A dónde te mudas?',
      fr: 'Où déménagez-vous?',
    },
    component: 'Step9ToAddress',
  },
  {
    id: 'step-10',
    order: 10,
    title: {
      en: 'Extras',
      es: 'Extras',
      fr: 'Extras',
    },
    description: {
      en: 'Would you like any additional services?',
      es: '¿Te gustaría algún servicio adicional?',
      fr: 'Souhaitez-vous des services supplémentaires?',
    },
    component: 'Step10Extras',
  },
  {
    id: 'step-11',
    order: 11,
    title: {
      en: 'Contact',
      es: 'Contacto',
      fr: 'Contact',
    },
    description: {
      en: 'How can we reach you?',
      es: '¿Cómo podemos contactarte?',
      fr: 'Comment pouvons-nous vous joindre?',
    },
    component: 'Step11Contact',
  },
  {
    id: 'step-12',
    order: 12,
    title: {
      en: 'Quote',
      es: 'Precio',
      fr: 'Devis',
    },
    description: {
      en: 'Review your instant quote',
      es: 'Revisa tu cotización instantánea',
      fr: 'Vérifiez votre devis instantané',
    },
    component: 'Step12Quote',
  },
];

/**
 * Get step by ID
 */
export function getStepById(stepId: string): Step | undefined {
  return CALCULATOR_STEPS.find((step) => step.id === stepId);
}

/**
 * Get step by order
 */
export function getStepByOrder(order: number): Step | undefined {
  return CALCULATOR_STEPS.find((step) => step.order === order);
}

/**
 * Get next step
 */
export function getNextStep(currentStepId: string): Step | null {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return null;

  return getStepByOrder(currentStep.order + 1) || null;
}

/**
 * Get previous step
 */
export function getPreviousStep(currentStepId: string): Step | null {
  const currentStep = getStepById(currentStepId);
  if (!currentStep) return null;

  return getStepByOrder(currentStep.order - 1) || null;
}

/**
 * Check if step is last
 */
export function isLastStep(stepId: string): boolean {
  const step = getStepById(stepId);
  if (!step) return false;

  return step.order === CALCULATOR_STEPS.length;
}

/**
 * Check if step is first
 */
export function isFirstStep(stepId: string): boolean {
  const step = getStepById(stepId);
  if (!step) return false;

  return step.order === 1;
}

/**
 * Calculate progress
 */
export function calculateProgress(stepId: string): number {
  const step = getStepById(stepId);
  if (!step) return 0;

  return Math.round((step.order / CALCULATOR_STEPS.length) * 100);
}

/**
 * Get total steps
 */
export function getTotalSteps(): number {
  return CALCULATOR_STEPS.length;
}
