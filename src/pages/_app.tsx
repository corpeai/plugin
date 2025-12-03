import { UnifiedWalletButton, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { ConnectionProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { JupiterProvider } from '@jup-ag/react-hook';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import classNames from 'classnames';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import Footer from 'src/components/Footer/Footer';
import CodeBlocks from 'src/components/CodeBlocks/CodeBlocks';
import FormConfigurator from 'src/components/FormConfigurator';
import IntegratedPlugin from 'src/content/IntegratedPlugin';
import V2SexyChameleonText from 'src/components/SexyChameleonText/V2SexyChameleonText';
import FeatureShowcaseButton from 'src/components/FeatureShowcaseButton';
import JupiterLogo from 'src/icons/JupiterLogo';
import CloseIcon from 'src/icons/CloseIcon';
import { Upsell } from 'src/components/Upsell';
import { JUPITER_DEFAULT_RPC } from 'src/constants';
import { IInit } from 'src/types';
import { setTerminalInView } from 'src/stores/jotai-terminal-in-view';

import { TokenContextProvider } from 'src/contexts/TokenContextProvider';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { NetworkConfigurationProvider } from 'src/contexts/NetworkConfigurationProvider';
import WalletPassthroughProvider from 'src/contexts/WalletPassthroughProvider';


function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 30000,
        retry: false,
      },
    },
  });
}

window.Jupiter.init({
  displayMode: "integrated",
  integratedTargetId: "target-container",
  formProps: {
    fixedMint: "So11111111111111111111111111111111111111112",
  },
});


const isDevNodeENV = process.env.NODE_ENV === 'development';
const isDeveloping = isDevNodeENV && typeof window !== 'undefined';
const isPreview = Boolean(process.env.NEXT_PUBLIC_IS_NEXT_PREVIEW);

if ((isDeveloping || isPreview) && typeof window !== 'undefined') {
  (window as any).Jupiter = {};

  Promise.all([import('../library'), import('../index')]).then((res) => {
    const [libraryProps, rendererProps] = res;
    (window as any).Jupiter = libraryProps;
    (window as any).JupiterRenderer = rendererProps;
  });
}



interface AppContentProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
  tab: IInit['displayMode'];
  setTab: React.Dispatch<React.SetStateAction<IInit['displayMode']>>;
  asLegacyTransaction: boolean;
  setAsLegacyTransaction: React.Dispatch<React.SetStateAction<boolean>>;
  watchAllFields: {
    simulateWalletPassthrough: boolean;
    refetchIntervalForTokenAccounts: number;
    formProps: any;
    strictTokenList: boolean;
    defaultExplorer: string;
    useUserSlippage: boolean;
  };
  formProps: any;
  displayMode: IInit['displayMode'];
  scriptDomain: string;
  rpcUrl: string;
  ShouldWrapWalletProvider: React.ComponentType<{ children: ReactNode }>;
}

function AppContent({
  Component,
  pageProps,
  tab,
  setTab,
  asLegacyTransaction,
  setAsLegacyTransaction,
  watchAllFields,
  formProps,
  displayMode,
  scriptDomain,
  rpcUrl,
  ShouldWrapWalletProvider,
}: AppContentProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Jupiter && window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
    setTerminalInView(false);
  }, [displayMode]);

  return (
    <JupiterProvider
      connection={connection}
      userPublicKey={publicKey || undefined}
      routeCacheDuration={300000} // 5 minutes in ms
      wrapUnwrapSOL={true}
    >
      <TokenContextProvider formProps={formProps}>
        <SwapContextProvider
          displayMode={displayMode}
          scriptDomain={scriptDomain}
          asLegacyTransaction={asLegacyTransaction}
          setAsLegacyTransaction={setAsLegacyTransaction}
          formProps={formProps}
        >
          <div className="bg-v3-bg min-h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
            <div>
              <AppHeader />
              <Component
                {...pageProps}
                rpcUrl={rpcUrl}
                watchAllFields={watchAllFields}
                ShouldWrapWalletProvider={ShouldWrapWalletProvider}
              />
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </div>
        </SwapContextProvider>
      </TokenContextProvider>
    </JupiterProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => getQueryClient());
  const [displayMode, setDisplayMode] = useState<IInit['displayMode']>('integrated');
  const [tab, setTab] = useState<IInit['displayMode']>('integrated');
  const [asLegacyTransaction, setAsLegacyTransaction] = useState(false);

  const rpcUrl = useMemo(() => JUPITER_DEFAULT_RPC, []);
  const endpoint = useMemo(() => rpcUrl, [rpcUrl]);

  const watchAllFields = {
    simulateWalletPassthrough: true,
    refetchIntervalForTokenAccounts: 10000,
    formProps: {},
    strictTokenList: true,
    defaultExplorer: 'solscan',
    useUserSlippage: false,
  };

  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

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
  }, [wallets, watchAllFields.simulateWalletPassthrough]);

  // Provide defaults for SwapContextProvider
  const displayMode: IInit['displayMode'] = 'integrated';
  const scriptDomain: IInit['scriptDomain'] = 'localhost';
  const formProps = watchAllFields.formProps;

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
      <ConnectionProvider endpoint={endpoint}>
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
          <NetworkConfigurationProvider localStoragePrefix="swapfy">
            <WalletPassthroughProvider>
              <AppContent
                Component={Component}
                pageProps={pageProps}
                displayMode={displayMode} 
                setDisplayMode=(setDisplayMode}
                tab={tab}
                setTab={setTab}
                asLegacyTransaction={asLegacyTransaction}
                setAsLegacyTransaction={setAsLegacyTransaction}
                watchAllFields={watchAllFields}
                formProps={formProps}
                displayMode={displayMode}
                scriptDomain={scriptDomain}
                rpcUrl={rpcUrl}
                ShouldWrapWalletProvider={ShouldWrapWalletProvider}
              />
            </WalletPassthroughProvider>
          </NetworkConfigurationProvider>
        </UnifiedWalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}



