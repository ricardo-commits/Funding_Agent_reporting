import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-14 items-center px-3 sm:px-4">
              <SidebarTrigger className="mr-2 flex-shrink-0" />
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-heading font-semibold text-foreground truncate">
                  Funding Agent Dashboard
                </h1>
              </div>
            </div>
          </header>
          <main className="flex-1 bg-background min-w-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}