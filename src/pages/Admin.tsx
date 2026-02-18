import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminUFCPicks } from "@/components/admin/AdminUFCPicks";
import { AdminContests } from "@/components/admin/AdminContests";
import { AdminTransactions } from "@/components/admin/AdminTransactions";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminSupportTickets } from "@/components/admin/AdminSupportTickets";
import { AdminWithdrawals } from "@/components/admin/AdminWithdrawals";
import { AdminDeposits } from "@/components/admin/AdminDeposits";
import { AdminProcessingFees } from "@/components/admin/AdminProcessingFees";
import { ScrollArea } from "@/components/ui/scroll-area";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <AdminUsers />;
      case "picks-ufc":
        return <AdminUFCPicks />;
      case "contests":
        return <AdminContests />;
      case "withdrawals":
        return <AdminWithdrawals />;
      case "deposits":
        return <AdminDeposits />;
      case "processing-fees":
        return <AdminProcessingFees />;
      case "transactions-deposits":
        return <AdminTransactions type="deposits" />;
      case "transactions-withdrawals":
        return <AdminTransactions type="withdrawals" />;
      case "support-tickets":
        return <AdminSupportTickets />;
      case "support":
        return <AdminSupportTickets />;
      case "audit-logs":
        return <AdminAuditLogs />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Admin;
