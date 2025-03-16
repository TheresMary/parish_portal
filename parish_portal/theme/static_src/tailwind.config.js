module.exports = {
    content: [
        '../templates/**/*.html',
        '../../templates/**/*.html',
        '!../../**/node_modules',
        '../../**/*.js',
        '../../**/*.py'
    ],
    theme: {
        extend: {
            fontFamily: {
              plusjakarta: ["Plus Jakarta Sans", "sans-serif"],
            },
            fontWeight: {
              light: '300',
              normal: '400',
              medium: '500',
              semibold: '600',
              bold: '700',
              extrabold: '800'
            },
            fontSize: {
              'xs': '12px',
              'sm': '14px',
              'base': '16px',
              'lg': '18px',
              'xl': '20px',
              '2xl': '24px',
              '2.5xl': '27px',
              '3xl': '32px',
              '4xl': '36px',
              '5xl': '40px',
              '6xl': '48px',
            },
            colors: {
              black: {
                light: '#101828',
                medium: '#141515',
                dark: '#000000',
              },
              gray: {
                light: '#E8EAEE',
                medium: '#F8F8F8',
                dark: '#F0F0F0',
                blue: '#F9FAFB',
                extraDark: '#A1A1AA',
              },
              pink: '#FEEBEB',
              activeGreen: '#1A8245',
              mintGreen: '#DAF8E6',
              bayouxBlue: '#4E5B72',
              navyBlue: '#3B82F6',
              red: '#FF0000',
              primary: 'var(--primary-color)',
              secondary: 'var(--secondary-color)',
              accent: 'var(--accent-color)',
            },
            width: {
              '2.5': '0.65rem',
              '6.5': '1.65rem',
              '22': '5.5rem',
              '34': '9rem',
              '47': '11.5rem',
              '94': '20rem',
              'pagination': 'calc(100vw - 280px)'
            },
            zIndex: {
              toast: '25',
            },
        },
    },
}
