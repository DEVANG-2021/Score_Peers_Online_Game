import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentPage="privacy" />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Overview</h2>
            <p className="text-muted-foreground">
              This Privacy Policy explains how Score Peers collects, uses, and protects your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground">We may collect:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Email address</li>
              <li>Username</li>
              <li>Account activity and challenge participation data</li>
              <li>Device and usage data</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do not require physical addresses or phone numbers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Information</h2>
            <p className="text-muted-foreground">We use information to:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Operate and maintain the Platform</li>
              <li>Manage user accounts and challenges</li>
              <li>Provide customer support</li>
              <li>Improve platform performance and security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Sweepstakes Compliance</h2>
            <p className="text-muted-foreground">
              SP Cash is provided as a sweepstakes promotional prize. It cannot be purchased and is awarded through participation, promotions, or free methods.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement reasonable safeguards to protect user data. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain user data only as long as necessary for platform operation and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Account Deletion</h2>
            <p className="text-muted-foreground">If you delete your account:</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Your account is permanently deactivated</li>
              <li>Login and password reset are disabled</li>
              <li>Some records may be retained for legal or compliance purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Score Peers is not intended for users under 18. We do not knowingly collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Policy Updates</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. Updates take effect upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Contact</h2>
            <p className="text-muted-foreground">
              For privacy questions or requests, contact: <a href="mailto:support@scorepeers.com" className="text-primary hover:underline">support@scorepeers.com</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
