import { useState } from 'react';
import { PageContainer } from '@package/pro/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@package/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@package/ui/tabs';
import { Button } from '@package/ui/button';
import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';
import { Textarea } from '@package/ui/textarea';
import { Switch } from '@package/ui/switch';
import { Badge } from '@package/ui/badge';
import { Avatar, AvatarFallback } from '@package/ui/avatar';
import { toast } from '@package/ui/toast';
import { useAuth } from '../../store/auth';
import { SmartphoneIcon, LaptopIcon } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [department, setDepartment] = useState(currentUser.department);
  const [bio, setBio] = useState('Platform engineer focusing on distributed edge architecture and universal cross-platform systems.');

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account profile updated successfully');
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings saved');
  };

  return (
    <PageContainer
      title="Account Settings"
      description="Ant Design Pro-style personalized account preferences, security credentials, and notification toggles."
      breadcrumbs={['Universal Pro', 'User Account', 'Settings']}
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 h-9">
          <TabsTrigger value="profile" className="text-xs px-4">Basic Profile</TabsTrigger>
          <TabsTrigger value="security" className="text-xs px-4">Security & 2FA</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs px-4">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-border/70 shadow-xs max-w-3xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Personal Profile</CardTitle>
              <CardDescription className="text-xs">
                Your enterprise profile details are visible to members in your active workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="flex items-center gap-4 pb-2">
                  <Avatar className="size-16">
                    <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                      {name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" type="button" className="h-7 text-xs">
                      Change Avatar
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-1">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Work Email</Label>
                    <Input
                      value={currentUser.email}
                      disabled
                      className="text-xs h-8 bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Job Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Department</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Professional Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" size="sm" className="h-8 text-xs font-semibold shadow-xs">
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6 max-w-3xl">
            <Card className="border-border/70 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription className="text-xs">
                  Add an additional layer of security to your enterprise account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <SmartphoneIcon className="size-5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Authenticator App (TOTP)</div>
                      <div className="text-[11px] text-muted-foreground">Google Authenticator, 1Password, or Authy.</div>
                    </div>
                  </div>
                  <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
                <CardDescription className="text-xs">
                  Devices currently authenticated with your platform credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/70">
                  <div className="flex items-center gap-3">
                    <LaptopIcon className="size-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>MacBook Pro 16" (Sonoma)</span>
                        <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-600 px-1 py-0">Current Session</Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">Chrome 131 · 198.51.100.24 · US East</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast.success('Signed out session')} className="text-xs text-destructive hover:bg-destructive/10 h-7">
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-border/70 shadow-xs max-w-3xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">
                Configure real-time in-app alerts and asynchronous email dispatches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <div className="font-semibold text-foreground">Critical Infrastructure Alerts</div>
                  <div className="text-[11px] text-muted-foreground">Notify when cluster node load exceeds threshold.</div>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <div className="font-semibold text-foreground">Weekly Executive Digest</div>
                  <div className="text-[11px] text-muted-foreground">Summarized conversion metrics and project health.</div>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>

              <div className="pt-2">
                <Button size="sm" onClick={handleSaveSecurity} className="h-8 text-xs font-semibold shadow-xs">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
