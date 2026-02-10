import { tv } from 'tailwind-variants'

export const settingsTabItem = tv({
  base: [
    'flex items-center gap-3 rounded-lg px-3 py-2.5',
    'cursor-pointer transition-colors',
  ],
  variants: {
    active: {
      true: [
        'bg-primary-bg font-medium text-text-dark',
        'dark:bg-amber-300/20 dark:text-amber-200',
      ],
      false: [
        'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
      ],
    },
  },
  defaultVariants: { active: false },
})

export const settingsLayout = tv({
  slots: {
    container: [
      'flex flex-col gap-6',
      'md:flex-row md:gap-8',
    ],
    sidebar: [
      'shrink-0',
      'md:sticky md:top-20 md:w-56 md:self-start',
    ],
    content: 'min-w-0 flex-1',
  },
})

export const dangerZone = tv({
  base: [
    'rounded-xl border-2 border-red-200 bg-red-50 p-4',
    'dark:border-red-800/50 dark:bg-red-950/20',
    'sm:p-5 lg:p-6',
  ],
})
