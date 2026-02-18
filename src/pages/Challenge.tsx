import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContestLobby } from "@/components/contests/ContestLobby";
import { ParlayBuilder } from "@/components/parlay/ParlayBuilder";
import { CreateContestModal } from "@/components/contests/CreateContestModal";
import { JoinContestModal } from "@/components/contests/JoinContestModal";
import { ExplorePicks, SelectedPick, SavedList } from "@/components/explore/ExplorePicks";
import { ContestResults } from "@/components/contests/ContestResults";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, RefreshCw, Search, BarChart3, Bookmark, Trash2, TrendingUp, TrendingDown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext"; 

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

  interface SavedPick {
      id: string;
      game_id: string;
      fight_id: string;
      player_prop_id: string;
      selection: 'over' | 'under';
      result: string;
      created_at: string;
      player_props: {
        id: string;
        player_name: string;
        player_image: string | null;
        prop_type: string;
        line: number;
        fights: {
          fighter_a: string;
          fighter_b: string;
        };
      };
      games: {
        name: string;
        game_date: string;
      };
  }

  interface SavedList {
    list_name: string;
    game_id: string;
    game_name: string;
    picks: SavedPick[];
  }
const Challenge = () => {
  const [showParlayBuilder, setShowParlayBuilder] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedContestLegs, setSelectedContestLegs] = useState(3);
  const [selectedContest, setSelectedContest] = useState<{
    id: string;
    predictions: number;
    entryFee: number;
    maxPlayers: number;
    currentPlayers: number;
    sport: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("lobby");
  const [savedPicks, setSavedPicks] = useState<SelectedPick[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [savedPicksFromDB, setSavedPicksFromDB] = useState<SavedPick[]>([]);
  const [loadingSavedPicks, setLoadingSavedPicks] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pickToDelete, setPickToDelete] = useState<string | null>(null);
  const [listToDelete, setListToDelete] = useState<string | null>(null); // Changed from eventToDelete
  const [deleteType, setDeleteType] = useState<'pick' | 'list' | null>(null); // Changed from 'event' to 'list'
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchSavedPicks(session.user.id);
      }
    };
    getUser();

    const fetchProfile = async() => {
      try {
        const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('status, email')
              .eq('user_id', user.id)
              .single();
        
        if (profileError) {
          await supabase.auth.signOut();
          toast.error('Something went wrong, please try again later');
        }
        if (profile.status === 'inactive') {
          await supabase.auth.signOut();
          toast.error('This account has been deleted.');
          return { error: new Error('Account deleted') };
        }
        return { error: null };
      } catch (error) {toast.error('Something went wrong, please try again later!'); return { error };}
    }
    fetchProfile();
  }, []);
  const [savedListsFromDB, setSavedListsFromDB] = useState<SavedList[]>([]);
  const [loadingSavedLists, setLoadingSavedLists] = useState(false);
  const { currencyType } = useCurrency();
  // Add these state variables near your other useState declarations
  const [processingFees, setProcessingFees] = useState<{
    sp_cash: Record<number, number>;
    sp_coins: Record<number, number>;
  }>({
    sp_cash: {},
    sp_coins: {}
  });

  const [loadingFees, setLoadingFees] = useState(false);

  // Add this useEffect to fetch platform settings
  useEffect(() => {
    const fetchProcessingFees = async () => {
      setLoadingFees(true);
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('currency_type, entry_amount, processing_fee')
          .order('currency_type')
          .order('entry_amount');

        if (error) throw error;

        const fees: { sp_cash: Record<number, number>; sp_coins: Record<number, number> } = {
          sp_cash: {},
          sp_coins: {}
        };

        data?.forEach((setting: any) => {
          if (setting.currency_type === 'sp_cash') {
            fees.sp_cash[setting.entry_amount] = setting.processing_fee;
          } else if (setting.currency_type === 'sp_coins') {
            fees.sp_coins[setting.entry_amount] = setting.processing_fee;
          }
        });

        console.log('Loaded processing fees:', fees);
        setProcessingFees(fees);
      } catch (error) {
        console.error('Error fetching processing fees:', error);
        toast.error('Failed to load processing fees');
        
        // Fallback to hardcoded values if database fails
        setProcessingFees({
          sp_cash: {
            5: 0.25, 10: 0.25, 20: 0.50, 50: 2, 100: 5,
            200: 5, 300: 10, 400: 15, 500: 20
          },
          sp_coins: {
            1000: 50, 10000: 500, 20000: 1000, 50000: 2000,
            100000: 3000, 500000: 5000
          }
        });
      } finally {
        setLoadingFees(false);
      }
    };

    fetchProcessingFees();
  }, []);

  // Update the calculateProcessingFee function to use cached data
  const calculateProcessingFee = (entryFee: number, type: 'cash' | 'coins') => {
    const dbCurrencyType = type === 'cash' ? 'sp_cash' : 'sp_coins';
    const fee = processingFees[dbCurrencyType]?.[entryFee];
    
    if (fee === undefined) {
      toast.error('Processing fee not available. Please try again later.');
      return 0;
    }
    
    return fee;
  };

  // Add function to fetch saved lists
  const fetchSavedLists = async (userId: string) => {
    setLoadingSavedLists(true);
    try {
      const { data, error } = await supabase
        .from('picks')
        .select(`
          list_name,
          game_id,
          games!inner(name),
          player_props!inner(
            id,
            player_name,
            player_image,
            prop_type,
            line,
            fights!inner(
              fighter_a,
              fighter_b
            )
          ),
          selection
        `)
        .eq('user_id', userId)
        .not('list_name', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group picks by list_name
      const groupedLists = data.reduce((acc: Record<string, any>, pick: any) => {
        const listName = pick.list_name;
        if (!acc[listName]) {
          acc[listName] = {
            list_name: listName,
            game_id: pick.game_id,
            game_name: pick.games.name,
            picks: []
          };
        }
        acc[listName].picks.push({
          prop: {
            ...pick.player_props,
            fights: pick.player_props.fights
          },
          selection: pick.selection,
          fightId: pick.player_props.fights.id
        });
        return acc;
      }, {});

      setSavedListsFromDB(Object.values(groupedLists));
    } catch (error) {
      console.error('Error fetching saved lists:', error);
      toast.error('Failed to load saved lists');
    } finally {
      setLoadingSavedLists(false);
    }
  };

  // Update the useEffect to fetch saved lists
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchSavedPicks(session.user.id);
        fetchSavedLists(session.user.id); // Add this line
      }
    };
    
    getUser();
  }, []);

  // Join challenge handler
  const handleJoinContest = async (contestId: string, contest?: any) => {
    if (!user) {
      toast.error('Please login to join a challenge');
      return;
    }

    if (!contest) {
      toast.error('Challenge not found');
      return;
    }

    // Check if user is already in this contest
    const { data: existingEntry } = await supabase
      .from('contest_entries')
      .select('id')
      .eq('contest_id', contestId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingEntry) {
      toast.error('You have already joined this challenge');
      return;
    }

    setSelectedContest({
      id: contestId,
      predictions: contest.predictions,
      entryFee: contest.entryFee,
      maxPlayers: contest.maxPlayers,
      currentPlayers: contest.currentPlayers,
      sport: contest.sport,
    });
    setShowJoinModal(true);
  };

  const fetchContests = () => {
    window.dispatchEvent(new CustomEvent('refresh-contests'));
  };

  const handleJoinWithPicks = async (picks: SelectedPick[]) => {
    if (!user || !selectedContest) return;

    try {
      const processingFee = calculateProcessingFee(selectedContest.entryFee, currencyType);
      const totalCharge = selectedContest.entryFee + processingFee;

      // Check balance
      const { data: profileData } = await supabase
        .from('profiles')
        .select('sp_cash, sp_coins')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        const balance = currencyType === 'cash' ? profileData.sp_cash : profileData.sp_coins;
        if (balance < totalCharge) {
          toast.error(`Insufficient balance. You need ${totalCharge} ${currencyType === 'cash' ? 'SP Cash' : 'SP Coins'}`);
          return;
        }
      }

      // Get the selected list name from JoinContestModal
      const listName = picks.length > 0 ? 
        (savedListsFromDB.find(list => 
          list.picks.some(pick => 
            picks.some(p => p.prop.id === pick.prop?.id)
          )
        )?.list_name || 'My Picks') 
        : 'My Picks';

      // Create contest entry
      const { error } = await supabase
        .from('contest_entries')
        .insert({
          contest_id: selectedContest.id,
          user_id: user.id,
          list_name: listName,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already joined this challenge');
        } else {
          throw error;
        }
        return;
      }

      // Deduct balance
      await supabase
        .from('profiles')
        .update({
          [currencyType === 'cash' ? 'sp_cash' : 'sp_coins']: 
            currencyType === 'cash' 
              ? profileData.sp_cash - totalCharge
              : profileData.sp_coins - totalCharge
        })
        .eq('user_id', user.id);

      setShowJoinModal(false);
      setSelectedContest(null);
      toast.success(`Challenge joined! ${totalCharge} ${currencyType === 'cash' ? 'SP Cash' : 'SP Coins'} charged.`);
      
      // Refresh contest list
      fetchContests(); // You'll need to add this function
    } catch (error) {
      console.error('Error joining contest:', error);
      toast.error('Failed to join challenge');
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', contestId)
        .eq('created_by', user.id);

      if (error) throw error;

      toast.success('Challenge deleted successfully');
    } catch (error) {
      console.error('Error deleting contest:', error);
      toast.error('Failed to delete challenge');
    }
};
  const openDeleteConfirm = (type: 'pick' | 'list', id: string) => {
    setDeleteType(type);
    if (type === 'pick') {
      setPickToDelete(id);
    } else {
      setListToDelete(id);
    }
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === 'pick' && pickToDelete) {
      handleDeletePick(pickToDelete);
    } else if (deleteType === 'list' && listToDelete) {
      handleDeleteListPicks(listToDelete);
    }
  };
  
  const handleSubmitParlay = (picks: any[]) => {
    setShowParlayBuilder(false);
    toast.success("Prediction challenge submitted successfully!", {
      description: `Your ${picks.length}-leg prediction challenge has been locked in.`
    });
  };

  // Add this useEffect to listen for saved picks updates
  useEffect(() => {
    const handleSavedPicksUpdated = (event: CustomEvent) => {
      if (user && event.detail?.userId === user.id) {
        console.log('Saved picks updated, refreshing...');
        fetchSavedPicks(user.id);
        fetchSavedLists(user.id);
      }
    };

    window.addEventListener('saved-picks-updated', handleSavedPicksUpdated as EventListener);
    
    return () => {
      window.removeEventListener('saved-picks-updated', handleSavedPicksUpdated as EventListener);
    };
  }, [user]);

  // Also listen for tab changes to refresh
  useEffect(() => {
    if (activeTab === "saved" && user) {
      fetchSavedPicks(user.id);
      fetchSavedLists(user.id);
    }
  }, [activeTab, user]);

  const handleCreateContest = async (data: any) => {
    console.log('Starting contest creation with data:', data);
    if (!user) {
      toast.error('Please login to create a challenge');
      return;
    }

    if (!data.name || data.name.trim().length === 0) {
      toast.error('Please enter a challenge name');
      return;
    }

    if (!data.listName || data.picks.length === 0) {
      toast.error('Please select a saved list with picks');
      return;
    }

    try {
      // Get the current game event
      console.log('Checking for existing contest with name:', data.name);
    
      // Check for duplicate name FIRST (before any balance checks)
      const { data: existingContest, error: checkError } = await supabase
        .from('contests')
        .select('id')
        .eq('name', data.name.trim())
        .maybeSingle();

      if (!checkError && existingContest) {
        console.log('Duplicate contest name found:', data.name);
        toast.error('A challenge with this name already exists');
        return;
      }

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('sport', 'MMA')
        .eq('league', 'MMA')
        .gte('game_date', new Date().toISOString().split('T')[0])
        .order('game_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (gameError || !gameData) {
        toast.error('No upcoming event found');
        return;
      }

      // Get user's current balance BEFORE attempting to create contest
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('sp_cash, sp_coins')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        toast.error('Failed to fetch your balance');
        return;
      }

      const processingFee = calculateProcessingFee(data.entryFee, currencyType);
      const totalCharge = data.entryFee + processingFee;

      // Check balance in frontend first
      const balance = currencyType === 'cash' ? profileData.sp_cash : profileData.sp_coins;
      if (balance < totalCharge) {
        toast.error(`Insufficient balance. You need ${totalCharge} ${currencyType === 'cash' ? 'SP Cash' : 'SP Coins'}`);
        return;
      }


      console.log('Calling database function with parameters:', {
        p_name: data.name.trim(),
        p_created_by: user.id,
        p_list_name: data.listName
      });

      // Call the database function for atomic transaction
      const { data: contestData, error: contestError } = await supabase
        .rpc('create_contest_with_transaction', {
          p_name: data.name.trim(),
          p_game_id: gameData.id,
          p_sport: data.sport.toUpperCase(),
          p_league: 'UFC',
          p_entry_fee_cash: currencyType === 'cash' ? data.entryFee : 0,
          p_entry_fee_coins: currencyType === 'coins' ? data.entryFee : 0,
          p_processing_fee_cash: currencyType === 'cash' ? processingFee : 0,
          p_processing_fee_coins: currencyType === 'coins' ? processingFee : 0,
          p_currency_type: currencyType,
          p_num_predictions: data.predictions,
          p_max_players: data.players,
          p_created_by: user.id,
          p_list_name: data.listName,
          p_user_sp_cash: profileData.sp_cash,
          p_user_sp_coins: profileData.sp_coins,
          p_charge_cash: currencyType === 'cash' ? totalCharge : 0,
          p_charge_coins: currencyType === 'coins' ? totalCharge : 0
        });

      if (contestError) {
        if (contestError.message.includes('already exists')) {
          toast.error('A challenge with this name already exists');
        } else if (contestError.message.includes('Insufficient')) {
          toast.error(contestError.message);
        } else {
          throw contestError;
        }
        return;
      }

      setShowCreateModal(false);
      toast.success(`Challenge "${data.name}" created! ${totalCharge} ${currencyType === 'cash' ? 'SP Cash' : 'SP Coins'} charged.`);
      
      console.log('Contest created successfully:', contestData);
      // Refresh the contest list
      window.dispatchEvent(new CustomEvent('refresh-contests'));
      
    } catch (error: any) {
      console.error('Error creating contest:', error);
      toast.error('Failed to create challenge');
    }
  };

  const handlePicksChange = (picks: SelectedPick[]) => {
    setSavedPicks(picks);
  };

  // Make fetchSavedPicks available in the component scope
  const fetchSavedPicks = useCallback(async (userId: string) => {
    setLoadingSavedPicks(true);
    try {
      // First, get all games where the user has completed contests
      const { data: userContests, error: contestsError } = await supabase
        .from('contest_entries')
        .select(`
          contest_id,
          contests!inner(
            game_id,
            user_state
          )
        `)
        .eq('user_id', userId)
        .eq('contests.user_state', 'completed');

      if (contestsError) throw contestsError;

      // Get unique game IDs where user has completed contests
      const completedGameIds = Array.from(
        new Set(
          userContests?.map(entry => entry.contests?.game_id).filter(Boolean) || []
        )
      );

      console.log('Completed game IDs for user:', completedGameIds);

      // Then, get all saved picks
      const { data: picksData, error: picksError } = await supabase
        .from('picks')
        .select(`
          id,
          game_id,
          fight_id,
          player_prop_id,
          selection,
          result,
          created_at,
          list_name,
          player_props!inner(
            id,
            player_name,
            player_image,
            prop_type,
            line,
            fights!inner(
              fighter_a,
              fighter_b
            )
          ),
          games!inner(
            name,
            game_date
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (picksError) throw picksError;

      // Filter out picks from games where user has completed contests
      const filteredPicks = (picksData || []).filter(pick => 
        !completedGameIds.includes(pick.game_id)
      );
      setSavedPicksFromDB(filteredPicks);
    } catch (error) {
      toast.error('Failed to load saved picks');
    } finally {
      setLoadingSavedPicks(false);
    }
  }, []);

  
  useEffect(() => {
    if (!user) return;

    // Subscribe to picks table changes
    const channel = supabase
      .channel('picks_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'picks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('New pick added, refreshing...');
        fetchSavedPicks(user.id);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'picks',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('Pick deleted, refreshing...');
        fetchSavedPicks(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSavedPicks]);


  const handleDeletePick = async (pickId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('picks')
        .delete()
        .eq('id', pickId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Pick deleted');
      
      // Dispatch event for UI update
      window.dispatchEvent(new CustomEvent('saved-picks-updated', { 
        detail: { userId: user.id } 
      }));
      
      // Also refresh directly
      fetchSavedPicks(user.id);
    } catch (error) {
      console.error('Error deleting pick:', error);
      toast.error('Failed to delete pick');
    }
  };

  const handleDeleteListPicks = async (listName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('picks')
        .delete()
        .eq('list_name', listName)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('List deleted successfully');
      
      // Dispatch event for UI update
      window.dispatchEvent(new CustomEvent('saved-picks-updated', { 
        detail: { userId: user.id } 
      }));
      
      // Also refresh directly
      fetchSavedPicks(user.id);
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleCreateWithPicks = () => {
    if (savedPicks.length === 0) {
      setShowCreateModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreateList = (list: SavedList) => {
    setSavedLists(prev => [...prev, list]);
    setActiveTab("saved");
  };

  const handleDeleteList = (listId: string) => {
    setSavedLists(prev => prev.filter(l => l.id !== listId));
    toast.success("List deleted");
  };

  const formatPropType = (propType: string) => {
    const labels: Record<string, string> = {
      'points': 'Points',
      'pts_rebs_asts': 'PRA',
      'rebounds': 'Rebounds',
      'three_pt_made': '3PM',
      'assists': 'Assists',
      'pts_asts': 'Pts+Asts',
      'rebs_asts': 'Rebs+Asts'
    };
    return labels[propType] || propType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {deleteType === 'list' ? 'Delete This List?' : 'Delete This Pick?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {deleteType === 'list' 
                ? `This will permanently delete all picks in this list. This action cannot be undone.`
                : 'This will permanently delete this pick. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Header currentPage="challenge" />
      
      <main className="pt-24 flex-1">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(newTab) => {
            setActiveTab(newTab);
            // Refresh saved picks when switching to saved tab
            if (newTab === "saved" && user) {
              fetchSavedPicks(user.id);
              fetchSavedLists(user.id); // Also refresh lists if needed
            }
          }} className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6 sm:mb-8 mx-auto h-auto p-1">
              <TabsTrigger value="lobby" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Challenge </span>Lobby
              </TabsTrigger>
              <TabsTrigger value="explore" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Saved </span>Picks
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lobby" className="mt-0">
              <ContestLobby 
                onCreateContest={handleCreateWithPicks}
                onJoinContest={handleJoinContest}
                savedPicks={savedPicks}
              />
            </TabsContent>

            <TabsContent value="explore" className="mt-0">
              <ExplorePicks 
                selectedPicks={savedPicks}
                onPicksChange={handlePicksChange}
                onCreateList={handleCreateList}
              />
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-display font-bold">Your Saved Picks</h2>
                  {savedPicksFromDB.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("explore")}
                    >
                      Add More Picks
                    </Button>
                  )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => user && fetchSavedPicks(user.id)}
                      disabled={loadingSavedPicks}
                    >
                      {loadingSavedPicks ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                </div>

                {loadingSavedPicks ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : savedPicksFromDB.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Saved Picks Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Go to Explore, select your picks, and save them!
                    </p>
                    <Button variant="hero" onClick={() => setActiveTab("explore")}>
                      Explore Picks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 pb-12">
                    {/* Group picks by event */}
                    {Object.entries(
                      savedPicksFromDB.reduce((acc, pick) => {
                        const listKey = pick.list_name || 'Unnamed List';
                        if (!acc[listKey]) {
                          acc[listKey] = {
                            eventName: pick.games.name,
                            eventDate: pick.games.game_date,
                            gameId: pick.game_id,
                            picks: [],
                          };
                        }
                        acc[listKey].picks.push(pick);
                        return acc;
                      }, {} as Record<string, { eventName: string; eventDate: string; gameId: string; picks: SavedPick[] }>)
                    ).map(([listName, eventData]) => (
                      <Card key={listName} className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <div>
                            <CardTitle className="text-base font-display">
                              {listName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {eventData.eventName} • {new Date(eventData.eventDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{eventData.picks.length} picks</Badge>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => openDeleteConfirm('list', listName)} // Changed from gameId to listName
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {eventData.picks.map((pick) => (
                              <div
                                key={pick.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage
                                      src={pick.player_props.player_image || ''}
                                      alt={pick.player_props.player_name}
                                    />
                                    <AvatarFallback className="text-xs">
                                      <User className="w-4 h-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground">
                                        {pick.player_props.player_name}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={
                                          pick.selection === 'over'
                                            ? 'border-green-500/30 text-green-500'
                                            : 'border-red-500/30 text-red-500'
                                        }
                                      >
                                        {pick.selection === 'over' ? (
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                          <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {pick.selection.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <span>
                                        {pick.selection === 'over' ? '>' : '<'} {pick.player_props.line}{' '}
                                        {formatPropType(pick.player_props.prop_type)}
                                      </span>
                                      <span>•</span>
                                      <span className="text-xs">
                                        {pick.player_props.fights.fighter_a} vs{' '}
                                        {pick.player_props.fights.fighter_b}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {pick.result === 'pending' ? (
                                      <Badge variant="outline" className="text-muted-foreground">
                                        Pending
                                      </Badge>
                                    ) : pick.result === 'won' ? (
                                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                        Won
                                      </Badge>
                                    ) : pick.result === 'lost' ? (
                                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                        Lost
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                        Push
                                      </Badge>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => openDeleteConfirm('pick', pick.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>

                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              {eventData.picks.filter(p => p.result === 'won').length} Won •{' '}
                              {eventData.picks.filter(p => p.result === 'lost').length} Lost •{' '}
                              {eventData.picks.filter(p => p.result === 'pending').length} Pending
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(eventData.picks[0].created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-0">
              <ContestResults />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {showParlayBuilder && (
        <ParlayBuilder
          requiredLegs={selectedContestLegs}
          onSubmit={handleSubmitParlay}
          onClose={() => setShowParlayBuilder(false)}
        />
      )}

      {showCreateModal && (
        <CreateContestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          savedPicks={savedPicks}
          savedLists={savedListsFromDB} // Changed from savedLists
        />
      )}

      {showJoinModal && selectedContest && (
        <JoinContestModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedContest(null);
          }}
          onJoin={handleJoinWithPicks}
          contest={selectedContest}
          savedLists={savedListsFromDB} // Changed from savedLists
        />
      )}
    </div>
  );
};

export default Challenge;
