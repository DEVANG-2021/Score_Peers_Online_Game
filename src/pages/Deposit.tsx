import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, Check, Coins, Building2, Copy, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const SP_COIN_PACKAGES = [
  { id: 1, price: 10, coins: 1000, bonus: 10 },
  { id: 2, price: 25, coins: 2500, bonus: 25 },
  { id: 3, price: 50, coins: 5000, bonus: 50 },
  { id: 4, price: 100, coins: 10000, bonus: 100 },
  { id: 5, price: 250, coins: 25000, bonus: 250 },
  { id: 6, price: 500, coins: 50000, bonus: 500 },
];

const BANK_DETAILS = {
  bankName: "Chase Bank",
  accountName: "Score Peers LLC",
  accountNumber: "1234567890",
  routingNumber: "021000021",
  accountType: "Checking",
};

export default function Deposit() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [step, setStep] = useState<'packages' | 'checkout'>('packages');

  const spCashBalance = profile?.sp_cash_balance ?? 0;
  const spCoinsBalance = profile?.wallet_balance ?? 0;

  const selectedPkg = SP_COIN_PACKAGES.find(p => p.id === selectedPackage);

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackage(packageId);
  };

  const handlePurchase = () => {
    if (selectedPackage) {
      setStep('checkout');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleConfirmPayment = () => {
    toast({
      title: "Payment submitted",
      description: "We'll verify your transfer and credit your account within 24 hours.",
    });
    navigate('/contests');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (step === 'checkout') {
              setStep('packages');
            } else {
              navigate(-1);
            }
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg">
              {step === 'packages' ? 'Get SP Coins' : 'Checkout'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-sm">{spCoinsBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">{spCashBalance.toFixed(2)} SP Cash</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step 1: Package Selection */}
        {step === 'packages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Title Section */}
            <div className="text-center">
              <h2 className="font-display font-bold text-3xl mb-3">Get SP Coins</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Purchase SP Coins for entertainment use.<br />
                Each SP Coins purchase includes a promotional SP Cash bonus.
              </p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SP_COIN_PACKAGES.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    variant={selectedPackage === pkg.id ? "elevated" : "default"}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectPackage(pkg.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-yellow-500" />
                          </div>
                          <span className="font-display font-bold text-2xl">${pkg.price}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPackage === pkg.id 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedPackage === pkg.id && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-semibold text-foreground">
                          • {pkg.coins.toLocaleString()} SP Coins
                        </p>
                        <p className="text-primary font-medium">
                          • +{pkg.bonus} SP Cash promotional bonus
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Purchase Button */}
            <Button
              variant="hero"
              className="w-full h-14 text-lg"
              disabled={!selectedPackage}
              onClick={handlePurchase}
            >
              {selectedPackage 
                ? `Purchase ${SP_COIN_PACKAGES.find(p => p.id === selectedPackage)?.coins.toLocaleString()} SP Coins`
                : 'Select a Package'
              }
            </Button>

            {/* Important Notice */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                SP Coins are for entertainment purposes only and have no cash value.<br />
                SP Cash is a sweepstakes promotional bonus and cannot be purchased.<br />
                No purchase necessary. Void where prohibited. Terms apply.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Checkout */}
        {step === 'checkout' && selectedPkg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title Section */}
            <div className="text-center">
              <h2 className="font-display font-bold text-3xl mb-3">Complete Your Purchase</h2>
              <p className="text-muted-foreground">
                Send a bank transfer to complete your order
              </p>
            </div>

            {/* Order Summary */}
            <Card variant="glass">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-semibold">${selectedPkg.price} Package</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">SP Coins</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{selectedPkg.coins.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">SP Cash Bonus</span>
                    <span className="font-semibold text-primary">+{selectedPkg.bonus} SP Cash</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-display font-bold text-2xl">${selectedPkg.price}.00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Notice */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Bank Transfer Only</p>
                <p className="text-sm text-muted-foreground">We only accept bank transfers for purchases</p>
              </div>
            </div>

            {/* Bank Details */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-4">Bank Transfer Details</h3>
                <div className="space-y-4">
                  {[
                    { label: "Bank Name", value: BANK_DETAILS.bankName },
                    { label: "Account Name", value: BANK_DETAILS.accountName },
                    { label: "Account Number", value: BANK_DETAILS.accountNumber },
                    { label: "Routing Number", value: BANK_DETAILS.routingNumber },
                    { label: "Account Type", value: BANK_DETAILS.accountType },
                    { label: "Amount", value: `$${selectedPkg.price}.00` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy(item.value, item.label)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Reference Note */}
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Important</p>
                      <p className="text-xs text-muted-foreground">
                        Include your email address in the transfer reference/memo so we can identify your payment.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirm Button */}
            <Button
              variant="hero"
              className="w-full h-14 text-lg"
              onClick={handleConfirmPayment}
            >
              I've Completed the Transfer
            </Button>

            {/* Processing Time Notice */}
            <p className="text-xs text-muted-foreground text-center">
              Transfers are typically verified within 24 hours. Your SP Coins and SP Cash bonus will be credited once the transfer is confirmed.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
