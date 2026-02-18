import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight, Phone, MapPin, Building, Shield, CheckCircle, Calendar } from 'lucide-react';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const signUpSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
});

const signInSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phoneNumber: z.string().trim().min(10, 'Please enter a valid phone number').max(20),
  streetAddress: z.string().trim().min(1, 'Street address is required').max(200),
  aptNumber: z.string().trim().max(20).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().min(2, 'State is required'),
  zipcode: z.string().trim().min(5, 'Please enter a valid zipcode').max(10),
});

type SignUpStep = 'credentials' | 'profile' | 'verification';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('credentials');
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [aptNumber, setAptNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Verification
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Simulated OTP code for testing
  const SIMULATED_OTP = '123456';

  const { user, signUp, signIn, refreshProfile, saveProfileInfo, resendVerificationEmail, loading } = useAuth();
  const navigate = useNavigate();

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Only redirect if user exists and profile is complete (has address info)
    if (user && signUpStep === 'credentials') {
      // Check if profile is complete
      checkProfileComplete();
    }
  }, [user]);

  const checkProfileComplete = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, street_address')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.first_name && profile?.last_name && profile?.street_address) {
      navigate('/'); // Redirect to dashboard
    } else {
      navigate('/profile'); // Redirect to profile completion page
    }
  };

  const validateCredentials = () => {
    setErrors({});
    const schema = isSignUp ? signUpSchema : signInSchema;
    const data = isSignUp ? { email, password, username } : { email, password };

    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const validateProfile = () => {
    setErrors({});
    const data = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      streetAddress,
      aptNumber: aptNumber || undefined,
      city,
      state,
      zipcode,
    };

    const result = profileSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      // Check profile status first
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('email', forgotEmail)
        .maybeSingle();

      if (profile?.status === 'disabled') {
        toast.error('This account is disabled. Please contact support.');
        return;
      }

      if (profile?.status === 'deleted') {
        toast.error('This account has been deleted.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail,
        {
          redirectTo: `${window.location.origin}/profile`,
        }
      );

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          'Password reset link sent. Please check your email.'
        );
        setIsForgotPassword(false);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentials()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Please complete your profile.');
          setSignUpStep('profile');
        }
      } else {
        const { data, error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        // Only ACTIVE users reach here
        toast.success('Welcome back!');
        navigate('/challenge');

      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile()) return;

    setIsLoading(true);

    try {
      // Save profile information to database
      const { error } = await saveProfileInfo(
        email,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber,
        streetAddress,
        aptNumber,
        city,
        state,
        zipcode,
        'United States'
      );

      if (error) {
        toast.error('Error saving profile:', error.message);
        setIsLoading(false);
        return;
      }

      // Move to verification step
      toast.success('Profile saved! Please verify your email.');
      toast.info(`A verification code has been sent to ${email}`);
      setSignUpStep('verification');
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup',
      });

      if (!error) {
        // Update is_verified to true in profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating is_verified:', updateError.message);
          toast.error('Verification saved but profile update failed. Please try again.');
        } else {
          toast.success('Verification successful! Redirecting to challenge page...');
          // Refresh profile to get updated is_verified status
          const { user } = await supabase.auth.getUser();
          if (user) {
            await refreshProfile();
          }
          navigate('/challenge');
        }
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationEmail(email);
      startCooldown();
      toast.info(`Verification code resent to ${email}`);
    } catch (err: any) {
      alert(err.message || 'Failed to resend email');
    }
  };

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="Enter your registered email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setIsForgotPassword(false)}
      >
        Back to Login
      </Button>
    </form>
  );


  const renderCredentialsForm = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="hero"
        className="w-full gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          'Please wait...'
        ) : isSignUp ? (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );

  const renderProfileForm = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="(555) 555-5555"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="streetAddress"
            type="text"
            placeholder="123 Main Street"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            className="pl-10"
          />
        </div>
        {errors.streetAddress && (
          <p className="text-sm text-destructive">{errors.streetAddress}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="aptNumber">Apt/Suite (Optional)</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="aptNumber"
            type="text"
            placeholder="Apt 4B"
            value={aptNumber}
            onChange={(e) => setAptNumber(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            placeholder="New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipcode">Zipcode</Label>
          <Input
            id="zipcode"
            type="text"
            placeholder="10001"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
          />
          {errors.zipcode && (
            <p className="text-sm text-destructive">{errors.zipcode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            type="text"
            value="United States"
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setSignUpStep('credentials')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="submit"
          variant="hero"
          className="flex-1 gap-2"
          disabled={isLoading}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-6">
      {isVerified ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Email Verified!</h3>
          <p className="text-muted-foreground">Redirecting you to the app...</p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              We sent a verification code to
            </p>
            <p className="font-semibold text-foreground">{email}</p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* <p className="text-xs text-center text-muted-foreground">
            For testing, use code: <span className="font-mono font-semibold text-primary">123456</span>
          </p> */}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                setSignUpStep('profile');
                setOtpCode('');
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={isLoading || otpCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-primary hover:underline"
            >
              Didn't receive a code? Resend
            </button>
          </div>
        </>
      )}
    </form>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Button>

        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <span className="font-display font-bold text-primary-foreground text-xl">P</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={signUpStep}
                initial={{ opacity: 0, x: signUpStep === 'profile' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: signUpStep === 'profile' ? -20 : 20 }}
              >
                <CardTitle className="font-display text-2xl">
                  {signUpStep === 'verification'
                    ? 'Verify Your Email'
                    : signUpStep === 'profile' 
                      ? 'Complete Your Profile'
                      : isSignUp 
                        ? 'Create Account' 
                        : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="mt-2">
                  {signUpStep === 'verification'
                    ? 'Enter the code sent to your email'
                    : signUpStep === 'profile'
                      ? 'Please provide your personal information'
                      : isSignUp
                        ? 'Join ParlayPeers and start competing'
                        : 'Sign in to your account to continue'}
                </CardDescription>
              </motion.div>
            </AnimatePresence>

            {isSignUp && signUpStep === 'credentials' && (
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-6 h-1 rounded-full bg-primary" />
                <div className="w-6 h-1 rounded-full bg-muted" />
                <div className="w-6 h-1 rounded-full bg-muted" />
              </div>
            )}
            {signUpStep === 'profile' && (
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-6 h-1 rounded-full bg-primary" />
                <div className="w-6 h-1 rounded-full bg-primary" />
                <div className="w-6 h-1 rounded-full bg-muted" />
              </div>
            )}
            {signUpStep === 'verification' && (
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-6 h-1 rounded-full bg-primary" />
                <div className="w-6 h-1 rounded-full bg-primary" />
                <div className="w-6 h-1 rounded-full bg-primary" />
              </div>
            )}
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={signUpStep}
                initial={{ opacity: 0, x: signUpStep === 'profile' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: signUpStep === 'profile' ? -20 : 20 }}
              >
                {signUpStep === 'credentials'
                  ? isForgotPassword
                    ? renderForgotPasswordForm()
                    : renderCredentialsForm()
                  : signUpStep === 'profile'
                    ? renderProfileForm()
                    : renderVerificationForm()}
              </motion.div>
            </AnimatePresence>

            {signUpStep === 'credentials' && (
              <>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrors({});
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>

                {isSignUp && (
                  <p className="mt-4 text-xs text-center text-muted-foreground">
                    Create your account to start competing!
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}