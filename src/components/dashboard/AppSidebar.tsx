import { BarChart3, Users, MessageSquare, Settings, Target, TrendingUp } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
// import { useAuth } from '../auth/AuthProvider';
// import { Button } from '../ui/button';

const navigationItems = [
  {
    title: 'Overview',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Campaigns',
    url: '/campaigns',
    icon: Target,
  },
  // {
  //   title: 'Leads',
  //   url: '/leads',
  //   icon: Users,
  // },
  {
    title: 'Responses',
    url: '/responses',
    icon: MessageSquare,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
  // Admin Setup removed
];

export function AppSidebar() {
  const location = useLocation();
  // const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClasses = (path: string) =>
    isActive(path)
      ? 'bg-primary text-primary-foreground font-medium'
      : 'hover:bg-accent hover:text-accent-foreground';

  return (
    <Sidebar>
      <SidebarContent className="bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Funding Agent
              </h2>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User info and sign out removed - no authentication required */}
        {/* <div className="mt-auto p-4 border-t border-border">
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium text-foreground">{user?.email}</div>
              <div className="text-muted-foreground">Authenticated User</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div> */}
      </SidebarContent>
    </Sidebar>
  );
}