import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [saveState, setSaveState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setCompany(profile?.company ?? "");
  }, [profile]);

  useEffect(() => {
    setEmailAlerts(localStorage.getItem("adpulse-email-alerts") !== "false");
    setWeeklyDigest(localStorage.getItem("adpulse-weekly-digest") !== "false");
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveState({ error: null, success: null });

    const { error } = await updateProfile({
      full_name: fullName.trim(),
      company: company.trim() || null,
    });

    if (error) {
      setSaveState({ error, success: null });
      setSaving(false);
      return;
    }

    localStorage.setItem("adpulse-email-alerts", String(emailAlerts));
    localStorage.setItem("adpulse-weekly-digest", String(weeklyDigest));
    setSaveState({ error: null, success: "Settings updated successfully." });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Client Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your profile, reporting preferences, and communication settings aligned with your campaign workflow.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company</label>
                  <Input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Your brand or business name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input value={profile?.email ?? ""} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <div className="flex h-10 items-center rounded-xl border border-border bg-card px-3 text-sm text-foreground">
                    {profile?.role ?? "client"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
                Updating your profile here changes the account information shown across the client dashboard and communication screens.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground">Reporting Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/30 p-4">
                <div>
                  <div className="font-medium text-foreground">Email Alerts</div>
                  <div className="text-sm text-muted-foreground">Get notified when campaign status changes.</div>
                </div>
                <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts((value) => !value)} className="h-4 w-4 accent-indigo-500" />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/30 p-4">
                <div>
                  <div className="font-medium text-foreground">Weekly Digest</div>
                  <div className="text-sm text-muted-foreground">Receive a short campaign summary every week.</div>
                </div>
                <input type="checkbox" checked={weeklyDigest} onChange={() => setWeeklyDigest((value) => !value)} className="h-4 w-4 accent-indigo-500" />
              </label>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
                These preferences are stored locally for the current browser session in the project demo.
              </div>
            </CardContent>
          </Card>
        </div>

        {saveState.error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {saveState.error}
          </div>
        )}
        {saveState.success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {saveState.success}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Badge variant="secondary">Dashboard preferences</Badge>
          <Button variant="gradient" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
