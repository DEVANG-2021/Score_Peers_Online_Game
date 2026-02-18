import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

// ========== SCHEMA VALIDATIONS ==========
const EmailSchema = z.string().email('Invalid email format');
const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters');
const UsernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long');
const NameSchema = z.string().min(1, 'Name is required').max(50, 'Name too long');
const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
const DateSchema = z.string().refine((date) => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}, 'Invalid date format');
const ZipCodeSchema = z
  .string()
  .trim()
  .min(3, 'Postal code too short')
  .max(10, 'Postal code too long')
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9\s-]{1,8}[A-Za-z0-9]$/,
    'Invalid postal / ZIP code format'
  );
const StateSchema = z.string().length(2, 'State must be 2-letter code');
const GenderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

// Signup validation schema
const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema.optional(),
  firstName: NameSchema.optional(),
  lastName: NameSchema.optional(),
  dateOfBirth: DateSchema.optional(),
  gender: GenderSchema.optional(),
  phoneNumber: PhoneSchema.optional(),
  streetAddress: z.string().max(100).optional(),
  aptNumber: z.string().max(20).optional(),
  city: z.string().max(50).optional(),
  state: StateSchema.optional(),
  zipcode: ZipCodeSchema.optional(),
  country: z.string().max(50).optional(),
});

// Profile update schema
const ProfileUpdateSchema = z.object({
  email: EmailSchema,
  firstName: NameSchema.optional(),
  lastName: NameSchema.optional(),
  dateOfBirth: DateSchema.optional(),
  gender: GenderSchema.optional(),
  phoneNumber: PhoneSchema.optional(),
  streetAddress: z.string().max(100).optional(),
  aptNumber: z.string().max(20).optional(),
  city: z.string().max(50).optional(),
  state: StateSchema.optional(),
  zipcode: ZipCodeSchema.optional(),
  country: z.string().max(50).optional(),
});

// Sign in schema
const SignInSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

// Admin check function
const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Admin role check error:', error);
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  wallet_balance: number;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  phone_number: string | null;
  street_address: string | null;
  apt_number: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, username?: string, firstName?: string, lastName?: string, dateOfBirth?: string, gender?: string, phoneNumber?: string, streetAddress?: string, aptNumber?: string, city?: string, state?: string, zipcode?: string, country?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfileInfo: (email: string, firstName?: string, lastName?: string, dateOfBirth?: string, gender?: string, phoneNumber?: string, streetAddress?: string, aptNumber?: string, city?: string, state?: string, zipcode?: string, country?: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: (email: string) => Promise<void>;
  checkAdminAccess: (userId: string) => Promise<boolean>;
  claimDailyReward: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

   const resendVerificationEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };


  const claimDailyReward = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      // 1. Get current session for security
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user || session.user.id !== user.id) {
        return { success: false, error: "Session expired. Please login again." };
      }

      // 2. Server-side validation using RPC function
      const { data: rewardResult, error: rewardError } = await supabase
        .rpc('claim_daily_reward', {
          p_user_id: user.id,
          p_sp_coins_amount: 1000,
          p_sp_cash_amount: 0.5
        });

      if (rewardError) {
        console.error("Daily reward error:", rewardError);
        
        // Handle specific error messages
        if (rewardError.message.includes("already claimed")) {
          return { success: false, error: "You've already claimed today's reward. Please wait 24 hours." };
        }
        
        return { success: false, error: "Failed to claim reward. Please try again." };
      }

      if (!rewardResult || !rewardResult.success) {
        return { success: false, error: rewardResult?.message || "Failed to claim reward" };
      }

      // 3. Refresh profile data after successful claim
      await refreshProfile();
      
      return { 
        success: true,
        error: undefined
      };

    } catch (error) {
      console.error("Unexpected error in claimDailyReward:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const checkAndSetAdminStatus = async (userId: string) => {
    const adminStatus = await checkAdminRole(userId);
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      await checkAndSetAdminStatus(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          await checkAndSetAdminStatus(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        await checkAndSetAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to check admin access (exported for use in components)
  const checkAdminAccess = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    return await checkAdminRole(userId);
  };

  const signUp = async (
    email: string,
    password: string,
    username?: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string,
    gender?: string,
    phoneNumber?: string,
    streetAddress?: string,
    aptNumber?: string,
    city?: string,
    state?: string,
    zipcode?: string,
    country?: string
  ) => {
    try {
      // Schema validation
      const validationResult = SignUpSchema.safeParse({
        email,
        password,
        username,
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
        country,
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Validation failed';
        return { error: new Error(errorMessage) };
      }

      const finalUsername = username || email.split('@')[0];

      // Input sanitization
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedUsername = finalUsername.trim();

      // Check if email or username already exists using secure RPC function
      const { data: availabilityCheck, error: checkError } = await supabase
        .rpc('check_email_username_availability', {
          p_email: sanitizedEmail,
          p_username: sanitizedUsername,
        });

      if (checkError) {
        console.error('Error checking availability:', checkError.message);
        return { error: new Error('Error checking account availability') };
      }

      if (availabilityCheck && availabilityCheck[0]) {
        const { email_exists, username_exists } = availabilityCheck[0];
        
        if (email_exists) {
          return { error: new Error('An account with this email already exists.') };
        }
        
        if (username_exists) {
          return { error: new Error('This username is already taken. Please choose another.') };
        }
      }

      // Rate limiting check (optional - implement based on your needs)
      // You can add rate limiting logic here

      // Proceed with sign-up if email and username don't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password.trim(),
        options: {
          data: {
            username: sanitizedUsername,
          },
        },
      });

      if (signUpError) {
        console.error('Sign-up error:', signUpError.message);
        return { error: new Error('Error creating account. Please try again.') };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected error in signUp:', err);
      return { error: new Error('An unexpected error occurred') };
    }
  };

  const saveProfileInfo = async (
    email: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string,
    gender?: string,
    phoneNumber?: string,
    streetAddress?: string,
    aptNumber?: string,
    city?: string,
    state?: string,
    zipcode?: string,
    country?: string
  ) => {
    try {
      // Schema validation
      const validationResult = ProfileUpdateSchema.safeParse({
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
        country,
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Validation failed';
        return { error: new Error(errorMessage) };
      }

      // Input sanitization
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPhone = phoneNumber?.trim() || null;

      // Parse dateOfBirth to proper DATE format
      const parsedDateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName?.trim() || null,
          last_name: lastName?.trim() || null,
          date_of_birth: parsedDateOfBirth,
          gender: gender || null,
          phone_number: sanitizedPhone,
          street_address: streetAddress?.trim() || null,
          apt_number: aptNumber?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          zipcode: zipcode?.trim() || null,
          country: country?.trim() || 'United States',
        })
        .eq('email', sanitizedEmail)
        .select();

      if (updateError) {
        console.error('Error saving profile info:', updateError.message);
        return { error: updateError };
      }

      // Refresh profile after saving
      await refreshProfile();
      return { error: null };
    } catch (err) {
      console.error('Error in saveProfileInfo:', err);
      return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Schema validation
      const validationResult = SignInSchema.safeParse({ email, password });
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Validation failed';
        toast.error(errorMessage);
        return { error: new Error(errorMessage) };
      }

      // Input sanitization
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      // First, sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (authError) {
        toast.error('Invalid email or password');
        return { error: authError };
      }

      // Rate limiting check (you can implement this based on IP or user ID)

      // Fetch profile with status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status, email')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        toast.error('Account error. Please contact support.');
        return { error: new Error('Profile not found') };
      }

      // Account status validation
      if (profile.status === 'disabled') {
        await supabase.auth.signOut();
        toast.error('Your account has been disabled. Please contact support.');
        return { error: new Error('Account disabled') };
      }

      if (profile.status === 'inactive') {
        await supabase.auth.signOut();
        toast.error('This account has been deleted.');
        return { error: new Error('Account deleted') };
      }

      if (profile.status === 'banned') {
        await supabase.auth.signOut();
        toast.error('This account has been banned.');
        return { error: new Error('Account banned') };
      }

      // Check admin role and set status
      const adminStatus = await checkAdminRole(authData.user.id);
      setIsAdmin(adminStatus);

      toast.success('Welcome back!');
      navigate('/challenge');
      
      return { error: null };

    } catch (err) {
      console.error('Unexpected error in signIn:', err);
      await supabase.auth.signOut();
      toast.error('An unexpected error occurred. Please try again.');
      return { error: err instanceof Error ? err : new Error('Unexpected error') };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        saveProfileInfo,
        checkAdminAccess,
        claimDailyReward,
        resendVerificationEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ========== SECURITY UTILITIES ==========

// Helper function to validate admin access in components
export const withAdminValidation = async (userId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user || session.user.id !== userId) {
      console.error('Unauthorized access attempt');
      return false;
    }

    return await checkAdminRole(userId);
  } catch (error) {
    console.error('Admin validation error:', error);
    return false;
  }
};

// Helper function for secure data fetching with admin check
export const secureFetch = async <T,>(
  fetchFunction: () => Promise<T>,
  userId: string
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const isAdmin = await withAdminValidation(userId);
    if (!isAdmin) {
      return { data: null, error: new Error('Unauthorized access') };
    }

    const data = await fetchFunction();
    return { data, error: null };
  } catch (error) {
    console.error('Secure fetch error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};