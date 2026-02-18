// utils/rewardUtils.ts
import { supabase } from "@/integrations/supabase/client";

export const checkRewardEligibility = async (userId: string): Promise<{
  eligible: boolean;
  nextClaimTime?: Date;
  hoursRemaining?: number;
  message?: string;
}> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('last_daily_reward_claim')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return { eligible: false, message: "Profile not found" };
    }

    const currentTime = new Date();
    const lastClaim = profile.last_daily_reward_claim 
      ? new Date(profile.last_daily_reward_claim) 
      : null;

    if (!lastClaim) {
      return { eligible: true };
    }

    // Calculate hours since last claim
    const timeDiff = currentTime.getTime() - lastClaim.getTime();
    const hoursSinceLastClaim = timeDiff / (1000 * 60 * 60);

    if (hoursSinceLastClaim >= 24) {
      return { eligible: true };
    } else {
      const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
      const hoursRemaining = 24 - hoursSinceLastClaim;
      
      return {
        eligible: false,
        nextClaimTime,
        hoursRemaining: Math.max(0, hoursRemaining),
        message: `Next reward available in ${Math.ceil(hoursRemaining)} hours`
      };
    }
  } catch (error) {
    console.error("Error checking reward eligibility:", error);
    return { eligible: false, message: "Error checking eligibility" };
  }
};