import React from 'react';

type TabsContextType = {
  value: string;
  onValueChange?: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextType>({ value: '' });

export const Tabs: React.FC<{ value: string; onValueChange?: (v: string) => void } & React.HTMLAttributes<HTMLDivElement>> = ({ value, onValueChange, children, ...props }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div {...props}>{children}</div>
  </TabsContext.Provider>
);

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>{children}</div>
);

export const TabsTrigger: React.FC<{ value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ value, children, className = '', ...props }) => {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      className={className}
      aria-selected={isActive}
      onClick={() => ctx.onValueChange && ctx.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string } & React.HTMLAttributes<HTMLDivElement>> = ({ value, children, className = '', ...props }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div className={className} {...props}>{children}</div>
  );
};

export default Tabs;

