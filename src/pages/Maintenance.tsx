import { Wrench } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <Wrench className="h-14 w-14 text-warning mb-6" />
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        We'll be back soon
      </h1>
      <p className="text-muted-foreground max-w-md">
        The platform is currently under maintenance.
        <br />
        Please check back later. Thank you for your patience.
      </p>
    </div>
  );
};

export default Maintenance;
