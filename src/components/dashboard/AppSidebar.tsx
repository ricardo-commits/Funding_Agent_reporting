import { BarChart3, Users, MessageSquare, Settings, Target, TrendingUp, Moon, Sun } from 'lucide-react';
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
  useSidebar,
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
// import { useAuth } from '../auth/AuthProvider';

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
  const { theme, toggleTheme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar();
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

  const handleNavClick = () => {
    // Close sidebar on mobile when nav link is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col gap-2">
            <img 
              src="https://cdn.prod.website-files.com/67efd26a8d1c97e288c50c5b/67efe2bf18508d8ae1163d12_Group%2091.svg" 
              alt="Logo" 
              className="w-full h-auto max-h-12"
            />
            <h2 className="text-lg font-heading font-semibold text-foreground">
              Dashboard
            </h2>
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
                      onClick={handleNavClick}
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

        {/* Theme Toggle */}
        <div className="mt-auto p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}