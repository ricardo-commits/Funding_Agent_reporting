import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const embedCode = `<iframe
  src="${window.location.origin}"
  style="width:100%;height:100vh;border:0;border-radius:10px;background:#f6f8fb"
  title="Funding Agent Reporting"
  loading="lazy"
  referrerpolicy="no-referrer"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard',
    });
  };

  const copyConnectionString = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: 'Copied!',
      description: 'Connection string copied to clipboard',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your application preferences and configuration</p>
      </div>

      {/* Theme Settings */}
      <Card className="shadow-fa">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-4">
            <div className="space-y-1">
              <Label className="text-sm sm:text-base font-medium">Dark Mode</Label>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Toggle between light and dark theme
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
          {theme === 'dark' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="text-sm text-amber-800 dark:text-amber-200">
                Dark mode is now active! The theme will be saved and persist across sessions.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Information */}
      <Card className="shadow-fa">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Database Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Supabase Project URL</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  value="https://timfyefhggsjyiyjhakh.supabase.co"
                  readOnly
                  className="font-mono text-xs sm:text-sm h-10 flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => copyConnectionString('https://timfyefhggsjyiyjhakh.supabase.co')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Project ID</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  value="timfyefhggsjyiyjhakh"
                  readOnly
                  className="font-mono text-xs sm:text-sm h-10 flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => copyConnectionString('timfyefhggsjyiyjhakh')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">API Endpoint</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  value="https://timfyefhggsjyiyjhakh.supabase.co/rest/v1"
                  readOnly
                  className="font-mono text-xs sm:text-sm h-10 flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => copyConnectionString('https://timfyefhggsjyiyjhakh.supabase.co/rest/v1')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Badge variant="secondary" className="mt-0.5">Info</Badge>
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  To rotate API keys or manage authentication, visit your{' '}
                  <a
                    href="https://supabase.com/dashboard/project/timfyefhggsjyiyjhakh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Supabase Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Views */}
      <Card className="shadow-fa">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Available Data Views</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'v_channel_totals',
              'v_channel_positive',
              'v_responses_by_weekday',
              'v_daily_counts',
              'v_campaign_split'
            ].map((view) => (
              <div
                key={view}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="font-mono text-sm text-foreground">{view}</span>
                <Badge variant="outline">View</Badge>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="text-sm text-muted-foreground leading-relaxed">
              These database views provide pre-aggregated data for optimal dashboard performance.
              All queries use read-only access to these views.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      <Card className="shadow-fa">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Dashboard Embed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Embed Code</Label>
            <div className="text-sm text-muted-foreground">
              Use this HTML code to embed the dashboard in your website
            </div>
            <div className="relative">
              <textarea
                value={embedCode}
                readOnly
                className="w-full h-36 p-4 border border-border rounded-lg font-mono text-sm bg-muted resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3"
                onClick={copyEmbedCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>Note:</strong> The embedded dashboard will inherit the current authentication state.
              Ensure proper access controls are in place before embedding on public sites.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card className="shadow-fa">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Performance & Caching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <Label className="text-base font-medium">Query Cache Duration</Label>
              <div className="text-2xl font-bold text-primary">60 seconds</div>
              <div className="text-sm text-muted-foreground">Data refresh interval</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <Label className="text-base font-medium">Table Pagination</Label>
              <div className="text-2xl font-bold text-primary">20 rows</div>
              <div className="text-sm text-muted-foreground">Per page</div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed">
              Dashboard queries are cached for 60 seconds to improve performance. 
              Data refreshes automatically when filters are changed.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}