import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, Check, AlertCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const PRESET_AMOUNTS = [20, 50, 100, 150, 200, 250];
const MIN_WITHDRAWAL = 20;

export default function Withdraw() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [step, setStep] = useState<'amount' | 'method' | 'confirm'>('amount');
  
  // Bank account form fields
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  const spCashBalance = profile?.sp_cash_balance ?? 0;
  const withdrawAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  const handleAmountSelect = (amount: number) => {
    if (amount <= spCashBalance) {
      setSelectedAmount(amount);
      setCustomAmount("");
    }
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '');
    setCustomAmount(numValue);
    setSelectedAmount(null);
  };

  const handleContinue = () => {
    if (step === 'amount' && withdrawAmount >= MIN_WITHDRAWAL && withdrawAmount <= spCashBalance) {
      setStep('method');
    } else if (step === 'method' && bankName && accountName && accountNumber && routingNumber) {
      setStep('confirm');
    }
  };

  const handleWithdraw = () => {
    toast({
      title: "Redemption Requested",
      description: `Your redemption of ${withdrawAmount.toFixed(2)} SP Cash has been submitted for processing.`,
    });
    navigate('/contests');
  };

  const isAmountValid = withdrawAmount >= MIN_WITHDRAWAL && withdrawAmount <= spCashBalance;
  const isBankFormValid = bankName.trim() && accountName.trim() && accountNumber.trim() && routingNumber.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (step === 'confirm') setStep('method');
            else if (step === 'method') setStep('amount');
            else navigate(-1);
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg">Redeem SP Cash</h1>
            <p className="text-xs text-muted-foreground">
              Available: {spCashBalance.toFixed(2)} SP Cash
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{spCashBalance.toFixed(2)} SP Cash</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['amount', 'method', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step === s ? 'bg-primary text-primary-foreground' : 
                ['amount', 'method', 'confirm'].indexOf(step) > i ? 'bg-primary/20 text-primary' : 
                'bg-secondary text-muted-foreground'
              }`}>
                {['amount', 'method', 'confirm'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-12 h-0.5 ${['amount', 'method', 'confirm'].indexOf(step) > i ? 'bg-primary' : 'bg-secondary'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Amount */}
        {step === 'amount' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display font-bold text-2xl mb-2">Redeem SP Cash</h2>
              <p className="text-muted-foreground">Minimum withdrawal is {MIN_WITHDRAWAL} SP Cash or more</p>
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((amount) => {
                const isDisabled = amount > spCashBalance;
                return (
                  <motion.button
                    key={amount}
                    whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                    whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                    onClick={() => handleAmountSelect(amount)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isDisabled
                        ? 'border-border bg-secondary/30 text-muted-foreground cursor-not-allowed opacity-50'
                        : selectedAmount === amount
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <span className="font-display font-bold text-xl">{amount}</span>
                    <span className="text-xs text-muted-foreground block">SP Cash</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Or enter custom amount</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="text-lg font-semibold h-14 pr-20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">SP Cash</span>
              </div>
              {customAmount && parseFloat(customAmount) > spCashBalance && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient balance
                </p>
              )}
              {customAmount && parseFloat(customAmount) < MIN_WITHDRAWAL && parseFloat(customAmount) > 0 && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Minimum withdrawal is {MIN_WITHDRAWAL} SP Cash
                </p>
              )}
            </div>

            {/* Withdraw Method Preview */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Withdraw Method</label>
              <Card variant="glass">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Bank Account</p>
                    <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="hero"
              className="w-full h-14 text-lg"
              disabled={!isAmountValid}
              onClick={handleContinue}
            >
              Continue with {withdrawAmount.toFixed(2)} SP Cash
            </Button>
          </motion.div>
        )}

        {/* Step 2: Bank Account Details */}
        {step === 'method' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display font-bold text-2xl mb-2">Bank Account Details</h2>
              <p className="text-muted-foreground">Enter your bank account information</p>
            </div>

            {/* Bank Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  placeholder="e.g. Chase Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Holder Name</Label>
                <Input
                  id="account_name"
                  placeholder="Full name on account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routing_number">Routing Number</Label>
                <Input
                  id="routing_number"
                  placeholder="Enter routing number"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full h-14 text-lg"
              disabled={!isBankFormValid}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display font-bold text-2xl mb-2">Confirm Redemption</h2>
              <p className="text-muted-foreground">Please review your withdrawal details</p>
            </div>

            {/* Summary */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">Redemption Amount</span>
                <span className="font-display font-bold text-2xl text-primary">{withdrawAmount.toFixed(2)} SP Cash</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Withdraw Method</span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Bank Account</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <span className="text-sm font-medium">{bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <span className="text-sm font-medium">{accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <span className="text-sm font-medium">****{accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Routing Number</span>
                  <span className="text-sm font-medium">{routingNumber}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-center">
                <span className="font-semibold text-destructive">Important:</span>{" "}
                Please verify your bank details. Withdrawals to incorrect accounts may result in delays.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="hero"
                className="w-full h-14 text-lg"
                onClick={handleWithdraw}
              >
                Confirm Redemption
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep('method')}
              >
                Go Back
              </Button>
            </div>

            {/* Processing Time Notice */}
            <p className="text-xs text-muted-foreground text-center">
              Redemptions are typically processed within 3-5 business days.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
