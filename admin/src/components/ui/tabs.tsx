import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextProps {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [activeVal, setActiveVal] = React.useState(defaultValue);
  
  const currentVal = value !== undefined ? value : activeVal;
  const setVal = onValueChange !== undefined ? onValueChange : setActiveVal;

  return (
    <TabsContext.Provider value={{ value: currentVal, onValueChange: setVal }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const useTabs = () => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponents must be used inside a <Tabs> wrapper.");
  return ctx;
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg bg-secondary/80 p-1 text-muted-foreground border border-border/40 backdrop-blur-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, value, children, ...props }, ref) => {
  const { value: activeVal, onValueChange } = useTabs();
  const isActive = activeVal === value;

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "bg-background text-slate-900 dark:text-slate-100 shadow-sm border border-border/30 font-semibold"
          : "hover:bg-background/40 hover:text-slate-800 dark:hover:text-slate-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(({ className, value, children, ...props }, ref) => {
  const { value: activeVal } = useTabs();
  const isActive = activeVal === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
