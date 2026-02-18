import { motion } from "framer-motion";
import { Shield, Lock, Zap, MessageCircle } from "lucide-react";
export const Footer = () => {
  return <footer className="border-t border-border/30 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-xs">SP</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Score<span className="text-gradient-primary">Peers</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The skill-based sweepstakes platform. Player-vs-player, transparent, and fair.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => window.location.href = '/challenge'}>Challenges</li>
              <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => window.location.href = '/rules'}>How It Works</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">FAQ</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors" onClick={() => window.location.href = '/support'}>Contact Us</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Trust & Security</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Data Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>Fair Play Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sweepstakes Disclosure */}
        <div className="border-t border-border/30 mt-8 pt-8">
          <div className="text-xs text-muted-foreground space-y-1 mb-6">
            <p>No purchase necessary. A purchase does not increase chances of winning.</p>
            <p>SP Coins are entertainment-only and have no monetary value.</p>
            <p>SP Cash is a sweepstakes prize and cannot be purchased.</p>
            <p>SP Cash is awarded through free methods, promotional entries, or challenge results.</p>
            <p>Void where prohibited. Terms apply.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Score Peers. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">
            Must be 18+ to play. Please play responsibly.
          </p>
        </div>
      </div>
    </footer>;
};