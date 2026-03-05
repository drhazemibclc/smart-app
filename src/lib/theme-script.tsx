import Script from 'next/script';

export function ThemeScript() {
  return (
    <Script
      id='theme-script'
      strategy='beforeInteractive'
    >
      {`
        (function() {
          try {
            var theme = localStorage.getItem('theme');
            var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (theme === 'dark' || (!theme && systemPrefersDark)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        })();
      `}
    </Script>
  );
}
