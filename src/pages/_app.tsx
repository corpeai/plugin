import { UnifiedWalletButton, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { DefaultSeo } from 'next-seo';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

//import AppHeader from 'src/components/AppHeader/AppHeader';
import Footer from 'src/components/Footer/Footer';

import { SolflareWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWatch } from 'react-hook-form';
import CodeBlocks from 'src/components/CodeBlocks/CodeBlocks';
//import FormConfigurator from 'src/components/FormConfigurator';
//import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { IInit } from 'src/types';
//import V2SexyChameleonText from 'src/components/SexyChameleonText/V2SexyChameleonText';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setPluginInView } from 'src/stores/jotai-plugin-in-view';
import { cn } from 'src/misc/cn';
import { PluginGroup } from 'src/content/PluginGroup';
import SideDrawer from 'src/components/SideDrawer/SideDrawer';
import JupiterLogo from 'src/icons/JupiterLogo';
import CloseIcon from 'src/icons/CloseIcon';
import { Upsell } from 'src/components/Upsell';

const isDevNodeENV = process.env.NODE_ENV === 'development';
const isDeveloping = isDevNodeENV && typeof window !== 'undefined';
// In NextJS preview env settings
const isPreview = Boolean(process.env.NEXT_PUBLIC_IS_NEXT_PREVIEW);
if ((isDeveloping || isPreview) && typeof window !== 'undefined') {
  // Initialize an empty value, simulate webpack IIFE when imported
  (window as any).Jupiter = {};

  // Perform local fetch on development, and next preview
  Promise.all([import('../library'), import('../index')]).then((res) => {
    const [libraryProps, rendererProps] = res;

    (window as any).Jupiter = libraryProps;
    (window as any).JupiterRenderer = rendererProps;
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const PLUGIN_MODE: { label: string; value: IInit['displayMode'] }[] = [
  {
    label: 'Integrated',
    value: 'integrated',
  },
];

export default function App() {
  const [displayMode, setDisplayMode] = useState<IInit['displayMode']>('integrated');
 
  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }

    setPluginInView(false);
  }, [displayMode]);


  const simulateWalletPassthrough = useWatch({ control, name: 'simulateWalletPassthrough' });

  // Solflare wallet adapter comes with Metamask Snaps supports
  const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter(), new SolflareWalletAdapter()], []);

  const ShouldWrapWalletProvider = useMemo(() => {
    return simulateWalletPassthrough
      ? ({ children }: { children: ReactNode }) => (
          <UnifiedWalletProvider
            wallets={wallets}
            config={{
              env: 'mainnet-beta',
              autoConnect: true,
              metadata: {
                name: 'Jupiter Plugin',
                description: '',
                url: 'https://plugin.jup.ag',
                iconUrls: [''],
              },
              theme: 'jupiter',
            }}
          >
            {children}
          </UnifiedWalletProvider>
        )
      : React.Fragment;
  }, [wallets, simulateWalletPassthrough]);

  return (
    <QueryClientProvider client={queryClient}>
      <DefaultSeo
        title={'Jupiter Plugin'}
        openGraph={{
          type: 'website',
          locale: 'en',
          title: 'Plugin: add Jupiter Swap to your website or app',
          description: 'Bring the perfect swap to any web app. Jupiter Plugin is the easiest way to add full Ultra swap functionality to any website.',
          url: 'https://plugin.jup.ag/',
          site_name: 'Jupiter Plugin',
          images: [
            {
              url: `https://plugin.jup.ag/meta-og/jupiter-meta-plugin.webp`,
              alt: 'Jupiter Aggregator',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: 'jup.ag',
          handle: '@JupiterExchange',
        }}
      />
     
<div/>
              <div className="flex justify-center">
                <div className="max-w-[420px] mt-8 rounded-3xl flex flex-col md:flex-row w-full relative border border-white/10">
                  <ShouldWrapWalletProvider />
                    <div className=" h-full w-full rounded-xl flex flex-col">
                      <div className="flex flex-row justify-between py-3 px-2 border-b border-white/10">
                        {PLUGIN_MODE.map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => setDisplayMode(mode.value)}
                            type="button"
                            className={cn(
                              'relative px-4 py-2 justify-center text-white/20  rounded-full text-sm flex-1 ',
                              {
                                'bg-landing-primary/10 text-landing-primary': displayMode === mode.value,
                              },
                            )}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                          </div>
                          <div
                            className={cn('text-white text-center', {
                              hidden: !simulateWalletPassthrough,
                            })}
                          >
                            <UnifiedWalletButton />
                          </div>
                        </div>
                        <PluginGroup tab={displayMode} />
                      <div
                      <span className="flex justify-center text-center text-xs text-[#9D9DA6] mb-2">
                        {displayMode === 'integrated' ? 'Jupiter renders as a part of your dApp.' : null}
                      </span>
                    >
                   </>
                  </ShouldWrapWalletProvider>
                </div>
              </div>
            </div>
          </div>
          <Upsell/>
          <Footer />
        </div>
       </>
    </QueryClientProvider>
  );
}
  
