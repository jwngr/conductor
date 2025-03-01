/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Map your custom font sizes to Tailwind's standard typography scale
      fontSize: {
        // Standard Tailwind text utilities with custom values
        lg: ['1.125rem', '1.875rem'], // p tag (18px, 30px)
        xl: ['1.25rem', '2rem'], // h3 tag (20px, 32px)
        '2xl': [
          '1.5rem',
          {
            lineHeight: '2.25rem', // h2 tag (24px, 36px)
            letterSpacing: '0.2px',
            fontWeight: '600',
          },
        ],
        '3xl': ['1.875rem', '2.5rem'], // h1 tag (30px, 40px)
        base: [
          '1rem',
          {
            lineHeight: '1.5rem', // h5 tag (16px, 24px)
            letterSpacing: '0.05em', // wider tracking for uppercase
            textTransform: 'uppercase',
          },
        ],
        sm: [
          '0.875rem',
          {
            lineHeight: '1.25rem', // h6 tag (14px, 20px)
            letterSpacing: '0.1em', // even wider tracking for smallest heading
            textTransform: 'uppercase',
          },
        ],
      },
      // Map your custom spacing for margins, padding, etc.
      spacing: {
        2: '8px', // li:not(:last-of-type) margin-bottom and li padding-left
      },
    },
  },
  plugins: [
    // Import tailwindcss-animate using ES modules
    import('tailwindcss-animate'),
  ],
};
