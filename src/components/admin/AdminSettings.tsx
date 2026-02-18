import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Coins,
  Lock,
  Save,
} from "lucide-react";

interface FeeEntry {
  entry: number;
  fee: number;
}

export const AdminSettings = () => {
  const [spCoinsFees, setSpCoinsFees] = useState<FeeEntry[]>([]);
  const [spCashFees, setSpCashFees] = useState<FeeEntry[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: fees, error } = await supabase
        .from("platform_settings")
        .select("*")
        .order("entry_amount", { ascending: true });

      if (error) throw error;

      setSpCoinsFees(
        fees
          .filter(f => f.currency_type === "sp_coins")
          .map(f => ({ entry: Number(f.entry_amount), fee: Number(f.processing_fee) }))
      );

      setSpCashFees(
        fees
          .filter(f => f.currency_type === "sp_cash")
          .map(f => ({ entry: Number(f.entry_amount), fee: Number(f.processing_fee) }))
      );

      const { data: system } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();

      setMaintenanceMode(system?.value ?? false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    }
  };

  // SP Coins processing fees
  // const [spCoinsFees, setSpCoinsFees] = useState<FeeEntry[]>([
  //   { entry: 1000, fee: 50 },
  //   { entry: 10000, fee: 500 },
  //   { entry: 20000, fee: 1000 },
  //   { entry: 50000, fee: 2000 },
  //   { entry: 100000, fee: 3000 },
  //   { entry: 500000, fee: 5000 },
  // ]);

  // SP Cash processing fees
  // const [spCashFees, setSpCashFees] = useState<FeeEntry[]>([
  //   { entry: 5, fee: 0.25 },
  //   { entry: 10, fee: 0.25 },
  //   { entry: 20, fee: 0.50 },
  //   { entry: 50, fee: 2 },
  //   { entry: 100, fee: 5 },
  //   { entry: 200, fee: 5 },
  //   { entry: 300, fee: 10 },
  //   { entry: 400, fee: 15 },
  //   { entry: 500, fee: 20 },
  // ]);

  const handleSave = async () => {
    const confirm = window.confirm(
      `Are you sure you want to save this setting?`
    );

    if (!confirm) return;

    setSaving(true);
    try {
      const updates = [
        ...spCoinsFees.map(f => ({
          currency_type: "sp_coins",
          entry_amount: f.entry,
          processing_fee: f.fee,
        })),
        ...spCashFees.map(f => ({
          currency_type: "sp_cash",
          entry_amount: f.entry,
          processing_fee: f.fee,
        })),
      ];

      for (const row of updates) {
        const { error } = await supabase
          .from("platform_settings")
          .upsert(row, {
            onConflict: "currency_type,entry_amount",
          });

        if (error) throw error;
      }

      await supabase
        .from("system_settings")
        .update({ value: maintenanceMode })
        .eq("key", "maintenance_mode");

      toast.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };


  const updateSpCoinsFee = (index: number, fee: number) => {
    const updated = [...spCoinsFees];
    updated[index].fee = fee;
    setSpCoinsFees(updated);
  };

  const updateSpCashFee = (index: number, fee: number) => {
    const updated = [...spCashFees];
    updated[index].fee = fee;
    setSpCashFees(updated);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SP Coins Processing Fees */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Coins className="h-5 w-5 text-primary" />
              SP Coins Processing Fees
            </CardTitle>
            <CardDescription>Configure processing fees for SP Coins challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-muted-foreground border-b border-border pb-2">
              <span>Challenge Entry</span>
              <span>Processing Fee</span>
            </div>
            {spCoinsFees.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 items-center">
                <span className="text-foreground">{formatNumber(item.entry)} SP Coins</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={item.fee}
                    onChange={(e) => updateSpCoinsFee(index, Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground text-sm">SP Coins</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SP Cash Processing Fees */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Coins className="h-5 w-5 text-success" />
              SP Cash Processing Fees
            </CardTitle>
            <CardDescription>Configure processing fees for SP Cash challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-muted-foreground border-b border-border pb-2">
              <span>Challenge Entry</span>
              <span>Processing Fee</span>
            </div>
            {spCashFees.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 items-center">
                <span className="text-foreground">{formatNumber(item.entry)} SP Cash</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.25"
                    value={item.fee}
                    onChange={(e) => updateSpCashFee(index, Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground text-sm">SP Cash</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lock className="h-5 w-5 text-destructive" />
              System Settings
            </CardTitle>
            <CardDescription>Critical system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <Label className="text-foreground">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Disable all user access to the platform</p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
            {maintenanceMode && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning font-medium">⚠️ Maintenance Mode Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Users will see a maintenance page when they try to access the platform.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
