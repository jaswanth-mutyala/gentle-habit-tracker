import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Qonversion, {
  Environment,
  LaunchMode,
  QonversionConfigBuilder,
  type Entitlement,
  type Product,
} from 'react-native-qonversion';

type EntitlementMap = Map<string, Entitlement>;

interface QonversionContextType {
  isConfigured: boolean;
  isReady: boolean;
  isPremium: boolean;
  products: Record<string, Product>;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshEntitlements: () => Promise<boolean>;
}

const QonversionContext = createContext<QonversionContextType>({
  isConfigured: false,
  isReady: false,
  isPremium: false,
  products: {},
  purchaseProduct: async () => false,
  restorePurchases: async () => false,
  refreshEntitlements: async () => false,
});

function hasPremium(entitlements: EntitlementMap | null | undefined): boolean {
  if (!entitlements) return false;
  const premium = entitlements.get('premium');
  return Boolean(premium?.isActive);
}

function toProductRecord(products: Map<string, Product>): Record<string, Product> {
  const record: Record<string, Product> = {};
  products.forEach((product, key) => {
    record[key] = product;
  });
  return record;
}

export function QonversionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [products, setProducts] = useState<Record<string, Product>>({});

  const projectKey = process.env.EXPO_PUBLIC_QONVERSION_PROJECT_KEY;
  const isConfigured = Boolean(projectKey);

  useEffect(() => {
    if (!projectKey) {
      setIsReady(true);
      return;
    }

    let mounted = true;
    const environment =
      process.env.EXPO_PUBLIC_QONVERSION_ENV === 'production'
        ? Environment.PRODUCTION
        : Environment.SANDBOX;

    const config = new QonversionConfigBuilder(
      projectKey,
      LaunchMode.SUBSCRIPTION_MANAGEMENT
    )
      .setEnvironment(environment)
      .setEntitlementsUpdateListener({
        onEntitlementsUpdated: (entitlements) => {
          if (mounted) {
            setIsPremium(hasPremium(entitlements));
          }
        },
      })
      .build();

    const sdk = Qonversion.initialize(config);

    Promise.all([sdk.checkEntitlements(), sdk.products()])
      .then(([entitlements, productMap]) => {
        if (!mounted) return;
        setIsPremium(hasPremium(entitlements));
        setProducts(toProductRecord(productMap));
      })
      .catch((error) => {
        console.warn('Qonversion initialization failed:', error);
      })
      .finally(() => {
        if (mounted) {
          setIsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [projectKey]);

  const refreshEntitlements = useCallback(async () => {
    if (!projectKey) return false;

    const entitlements = await Qonversion.getSharedInstance().checkEntitlements();
    const active = hasPremium(entitlements);
    setIsPremium(active);
    return active;
  }, [projectKey]);

  const purchaseProduct = useCallback(
    async (productId: string) => {
      if (!projectKey) {
        throw new Error('Missing EXPO_PUBLIC_QONVERSION_PROJECT_KEY');
      }

      const sdk = Qonversion.getSharedInstance();
      const latestProducts =
        Object.keys(products).length > 0 ? products : toProductRecord(await sdk.products());
      const product = latestProducts[productId];

      if (!product) {
        throw new Error(`Qonversion product not found: ${productId}`);
      }

      const entitlements = await sdk.purchaseProduct(product, undefined);
      const active = hasPremium(entitlements);
      setIsPremium(active);
      return active;
    },
    [products, projectKey]
  );

  const restorePurchases = useCallback(async () => {
    if (!projectKey) {
      throw new Error('Missing EXPO_PUBLIC_QONVERSION_PROJECT_KEY');
    }

    const entitlements = await Qonversion.getSharedInstance().restore();
    const active = hasPremium(entitlements);
    setIsPremium(active);
    return active;
  }, [projectKey]);

  const value = useMemo(
    () => ({
      isConfigured,
      isReady,
      isPremium,
      products,
      purchaseProduct,
      restorePurchases,
      refreshEntitlements,
    }),
    [
      isConfigured,
      isReady,
      isPremium,
      products,
      purchaseProduct,
      restorePurchases,
      refreshEntitlements,
    ]
  );

  return <QonversionContext.Provider value={value}>{children}</QonversionContext.Provider>;
}

export function useQonversion() {
  return useContext(QonversionContext);
}
