import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Send, HelpCircle, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const issueCategories = [
  { value: "withdraw-help", label: "Withdraw Help" },
  { value: "deposit-help", label: "Deposit Help" },
  { value: "signup-help", label: "Signup Help" },
  { value: "contest-issue", label: "Contest Issue" },
  { value: "account-issue", label: "Account Issue" },
  { value: "payment-issue", label: "Payment Issue" },
  { value: "technical-issue", label: "Technical Issue" },
  { value: "feedback", label: "Feedback / Suggestion" },
  { value: "other", label: "Other" },
];

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

const validateName = (name: string): boolean => {
  const nameRegex = /^[A-Za-z\s'-]+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
};

const Support = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    issueCategory: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone (optional but if provided must be valid)
    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
      newErrors.phoneNumber = "Phone number is too long";
    }

    // Validate issue category
    if (!formData.issueCategory) {
      newErrors.issueCategory = "Please select an issue category";
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.length > 3000) {
      newErrors.message = "Message must not exceed 3000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-support-ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token && {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            }),
          },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            phoneNumber: formData.phoneNumber.trim() || null,
            issueCategory: formData.issueCategory,
            message: formData.message.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(result.error || "Rate limit exceeded. Please try again later.");
        } else {
          toast.error(result.error || "Failed to submit ticket");
        }
        setIsSubmitting(false);
        return;
      }

      setTicketNumber(result.ticketNumber);
      toast.success(`Ticket created successfully! Ticket #${result.ticketNumber}`);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        issueCategory: "",
        message: "",
      });
      setErrors({});

    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = formData.message.length;
  const maxCharacters = 3000;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentPage="support" />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">We are here to help</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Contact <span className="text-gradient-primary">Support</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Have a question or issue? Submit a ticket and our team will get back to you as soon as possible.
            </p>
          </motion.div>

          {/* Success Message */}
          {ticketNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <Alert className="bg-success/10 border-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  <strong>Ticket Created Successfully!</strong>
                  <br />
                  Your ticket number is: <strong>#{ticketNumber}</strong>
                  <br />
                  We will respond to your email within 24 hours.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1 space-y-4"
            >
              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Submit a Ticket</CardTitle>
                  <CardDescription>
                    Fill out the form and we will respond via email.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-success" />
                  </div>
                  <CardTitle className="text-lg">Response Time</CardTitle>
                  <CardDescription>
                    We typically respond within 24 hours during business days.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Priority Support</CardTitle>
                  <CardDescription>
                    Payment and withdrawal issues are handled with priority.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <CardTitle className="text-lg">Rate Limit</CardTitle>
                  <CardDescription>
                    You can submit 1 ticket every 15 minutes to prevent spam.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Please provide as much detail as possible so we can help you quickly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={errors.firstName ? "border-destructive" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={errors.lastName ? "border-destructive" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Contact Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          className={errors.phoneNumber ? "border-destructive" : ""}
                        />
                        {errors.phoneNumber && (
                          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Issue Category */}
                    <div className="space-y-2">
                      <Label htmlFor="issueCategory">Issue Category *</Label>
                      <Select
                        value={formData.issueCategory}
                        onValueChange={(value) => handleInputChange("issueCategory", value)}
                      >
                        <SelectTrigger className={errors.issueCategory ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select an issue category" />
                        </SelectTrigger>
                        <SelectContent>
                          {issueCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.issueCategory && (
                        <p className="text-sm text-destructive">{errors.issueCategory}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message">Describe Your Issue *</Label>
                        <span className={`text-xs ${
                          characterCount > maxCharacters 
                            ? "text-destructive" 
                            : characterCount > maxCharacters * 0.9 
                            ? "text-warning" 
                            : "text-muted-foreground"
                        }`}>
                          {characterCount} / {maxCharacters}
                        </span>
                      </div>
                      <Textarea
                        id="message"
                        placeholder="Please provide as much detail as possible about your issue or question... (10-3000 characters)"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        rows={6}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Minimum 10 characters, maximum 3000 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Ticket
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;