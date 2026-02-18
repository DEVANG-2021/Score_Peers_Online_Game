import { Button } from "@/components/ui/button";
import { Coins, Home, BookOpen, MessageSquare, Menu, LogIn, LogOut, User, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const Header = ({ onNavigate, currentPage = 'home' }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const { user, profile, signOut, claimDailyReward, refreshProfile } = useAuth();
  const { currencyType, setCurrencyType } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const walletBalance = profile?.sp_coins ?? 0;
  const spCashBalance = profile?.sp_cash ?? 0;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'rules', label: 'Rules', icon: BookOpen, path: '/rules' },
    { id: 'support', label: 'Contact', icon: MessageSquare, path: '/support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigation = (item: { id: string; path?: string }) => {
    if (item.path) {
      navigate(item.path);
    }
    onNavigate?.(item.id);
  };

  const handleLogoClick = () => {
    navigate('/');
    onNavigate?.('home');
  };

  // Replace the existing handleClaimDailyReward function with this enhanced version:
  const handleClaimDailyReward = async () => {
    if (isClaimingReward) return;
    
    setIsClaimingReward(true);
    
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await claimDailyReward();
      
      if (result.success) {
        toast({
          title: "🎉 Daily Reward Claimed!",
          description: (
            <div className="space-y-1">
              <p>+1,000 SP Coins and +0.50 SP Cash added to your wallet</p>
              <p className="text-xs text-muted-foreground">
                Next reward available in 24 hours
              </p>
            </div>
          ),
          duration: 5000,
        });
        
        // Refresh profile to show updated balances
        await refreshProfile();
      } else {
        toast({
          title: "⏰ Cannot Claim Yet",
          description: result.error || "Please try again later",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-xs">SP</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Score<span className="text-gradient-primary">Peers</span>
          </span>
        </motion.div>

        {/* Desktop Nav - Centered */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className="gap-2"
              onClick={() => handleNavigation(item)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Wallet & Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Currency Toggle */}
              <div className="hidden sm:flex items-center rounded-full bg-secondary/50 border border-border/50 p-0.5">
                <button
                  onClick={() => setCurrencyType('coins')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    currencyType === 'coins'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="hidden lg:inline">SP Coins</span>
                </button>
                <button
                  onClick={() => setCurrencyType('cash')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    currencyType === 'cash'
                      ? 'bg-success text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="hidden lg:inline">SP Cash</span>
                </button>
              </div>

              {/* Wallet Balance - Shows based on toggle */}
              <motion.div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50"
                whileHover={{ scale: 1.02 }}
              >
                {currencyType === 'coins' ? (
                  <>
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-foreground text-sm">{walletBalance.toFixed(0)}</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-success" />
                    <span className="font-semibold text-foreground text-sm">{spCashBalance.toFixed(2)}</span>
                  </>
                )}
              </motion.div>

              {/* Daily Reward Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-9 w-9 rounded-full border-primary/50 hover:bg-primary/10 relative ${
                      isClaimingReward ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    onClick={handleClaimDailyReward}
                    disabled={isClaimingReward}
                  >
                    <Gift className={`w-4 h-4 text-primary ${
                      isClaimingReward ? 'animate-spin' : ''
                    }`} />
                    
                    {/* Optional: Add a cooldown indicator */}
                    {isClaimingReward && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] p-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Daily Reward</p>
                    <p className="text-xs text-muted-foreground">
                      Claim 1,000 SP Coins + 0.50 SP Cash every 24 hours
                    </p>
                    <div className="pt-1 text-xs">
                      <div className="flex justify-between">
                        <span>SP Coins:</span>
                        <span className="font-medium text-yellow-500">+1,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SP Cash:</span>
                        <span className="font-medium text-success">+0.50</span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.username || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/deposit')}>
                    <Coins className="w-4 h-4 text-yellow-500" />
                    Get SP Coins
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => navigate('/withdraw')}>
                    <Coins className="w-4 h-4 text-success" />
                    Redeem SP Cash
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="hero" size="sm" onClick={() => navigate('/auth')} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background/95 backdrop-blur-xl border-border/50">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="font-display font-bold text-primary-foreground text-xs">SP</span>
                  </div>
                  <span className="font-display font-bold text-xl">
                    Score<span className="text-gradient-primary">Peers</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => {
                      handleNavigation(item);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                ))}
                {user && (
                  <>
                    <div className="my-4 border-t border-border/50" />
                    
                    {/* Mobile Currency Toggle */}
                    <div className="flex items-center rounded-full bg-secondary/50 border border-border/50 p-0.5 mb-2">
                      <button
                        onClick={() => setCurrencyType('coins')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          currencyType === 'coins'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        SP Coins
                      </button>
                      <button
                        onClick={() => setCurrencyType('cash')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          currencyType === 'cash'
                            ? 'bg-success text-white'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        SP Cash
                      </button>
                    </div>
                    
                    {/* Mobile Wallet Balance */}
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary/50 border border-border/50">
                      {currencyType === 'coins' ? (
                        <>
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-foreground">{walletBalance.toFixed(0)} SP Coins</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 text-success" />
                          <span className="font-semibold text-foreground">{spCashBalance.toFixed(2)} SP Cash</span>
                        </>
                      )}
                    </div>
                    
                    {/* Mobile Daily Reward */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 border-primary/50"
                      onClick={() => {
                        handleClaimDailyReward();
                        setMobileMenuOpen(false);
                      }}
                      disabled={isClaimingReward}
                    >
                      <Gift className="w-5 h-5 text-primary" />
                      Daily Reward
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
