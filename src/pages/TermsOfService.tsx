import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentPage="terms" />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Score Peers ("Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform.
            </p>
            <p className="text-muted-foreground mt-2">
              Score Peers is a skill-based sweepstakes challenge platform. It is not a gambling or sportsbook service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground">You must be:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>At least 18 years old</li>
              <li>Located in a jurisdiction where skill-based sweepstakes are permitted</li>
            </ul>
            <p className="text-muted-foreground mt-2">Void where prohibited by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Platform Overview</h2>
            <p className="text-muted-foreground">
              Score Peers allows users to participate in player-vs-player challenges based on skill and accuracy. Outcomes are determined by points scored, not chance.
            </p>
            <p className="text-muted-foreground mt-4">The Platform does not operate as:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>A sportsbook</li>
              <li>A casino</li>
              <li>A betting or wagering service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Platform Currencies</h2>
            <p className="text-muted-foreground">Score Peers uses two internal platform currencies:</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium text-foreground">SP Coins</h3>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Entertainment-only currency</li>
                <li>Have no cash or monetary value</li>
                <li>Used to enter SP Coin challenges</li>
                <li>Cannot be redeemed for money</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-foreground">SP Cash</h3>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Sweepstakes promotional prize credits</li>
                <li>Cannot be purchased</li>
                <li>Awarded through promotions, free methods, or challenge results</li>
                <li>May be redeemable subject to applicable rules and restrictions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Challenges & Scoring</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Users may create or join challenges using SP Coins or SP Cash</li>
              <li>Each correct prediction = 10 points</li>
              <li>Each incorrect prediction = 0 points</li>
              <li>The user(s) with the highest total score receive the challenge prize credits</li>
              <li>Ties result in prize credits split evenly</li>
              <li>Draws or expired challenges result in full refunds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Processing Fees</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>A processing fee is charged when creating or joining a challenge</li>
              <li>The fee is added on top of the challenge entry</li>
              <li>Fees are not deducted from prize credits</li>
              <li>If a challenge ends in a draw or expires, all entries and fees are refunded</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. No Purchase Necessary</h2>
            <p className="text-muted-foreground">
              No purchase is necessary to participate in sweepstakes challenges. A purchase does not increase chances of success.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Prohibited Conduct</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Use the Platform for unlawful purposes</li>
              <li>Attempt to manipulate results or scoring</li>
              <li>Exploit or abuse platform mechanics</li>
              <li>Use automated tools or bots</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Account Deletion</h2>
            <p className="text-muted-foreground">
              Users may delete their account at any time. Account deletion is permanent and cannot be reversed. Deleted accounts cannot be accessed or recreated using the same email address.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Score Peers is provided "as is." We are not responsible for interruptions, errors, or losses resulting from use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Modifications</h2>
            <p className="text-muted-foreground">
              We may update these Terms at any time. Continued use of the Platform constitutes acceptance of updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact</h2>
            <p className="text-muted-foreground">
              For questions or support, contact: <a href="mailto:support@scorepeers.com" className="text-primary hover:underline">support@scorepeers.com</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
