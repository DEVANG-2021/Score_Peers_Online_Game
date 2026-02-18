import { createContext, useContext, useState, ReactNode } from 'react';

type CurrencyType = 'coins' | 'cash';

interface CurrencyContextType {
  currencyType: CurrencyType;
  setCurrencyType: (type: CurrencyType) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currencyType, setCurrencyType] = useState<CurrencyType>('coins');

  return (
    <CurrencyContext.Provider value={{ currencyType, setCurrencyType }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
