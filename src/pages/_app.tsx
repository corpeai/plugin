import { Provider, useAtom } from 'jotai';
import JupiterApp from 'src/components/Jupiter';
import { ContextProvider } from 'src/contexts/ContextProvider';
import { ScreenProvider } from 'src/contexts/ScreenProvider';
import WalletPassthroughProvider from 'src/contexts/WalletPassthroughProvider';
import { appProps } from './library';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

const App = () => {
  const queryClient = useMemo(() => new QueryClient(), []);
  const [props] = useAtom(appProps);
  if (!props) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ContextProvider {...props}>
        <WalletPassthroughProvider>
          <ScreenProvider>
            <JupiterApp {...props} />
          </ScreenProvider>
        </WalletPassthroughProvider>
      </ContextProvider>
    </QueryClientProvider>
  );
};

const RenderJupiter = () => {
  return (
    <Provider store={typeof window !== 'undefined' ? window.Jupiter.store : undefined}>
      <App />
    </Provider>
  );
};

export { RenderJupiter };
