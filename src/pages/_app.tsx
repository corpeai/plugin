import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Script from "next/script";

window.Jupiter.init({
  displayMode: "integrated",
  integratedTargetId: "target-container",
  formProps: {
    fixedMint: "So11111111111111111111111111111111111111112",
  },
});


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://plugin.jup.ag/plugin-v1.js"
        strategy="beforeInteractive"
        data-preload
        defer
      />
      <Component {...pageProps} />
    </>
  );
}


