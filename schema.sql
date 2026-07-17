-- ============================================================================
-- MISSIONQUEST — DATABASE SCHEMA
-- Single source of truth for the whole backend: tables, RLS policies, triggers,
-- RPCs, storage buckets, seed data. There is no separate backend server — the
-- Supabase-generated REST API + these RLS policies ARE the API surface, and
-- anything atomic/cross-user is a SECURITY DEFINER RPC (see README.md
-- "Architecture" for the full explanation of that pattern).
--
-- Sections, in order (append-only in practice — new sections go at the end
-- rather than editing historical CREATE TABLE statements):
--   1. Profiles              8.  In-game ID links      15. Tournament banners
--   2. Wallets                9.  Notifications         16. Tournament ops A (roster)
--   3. Missions               10. Support tickets       17. Tournament ops B (bracket/lobby gen)
--   4. Mission attempts       11. Feedback / ratings    18. Tournament ops C (check-in)
--   5. Payout requests        12. Account deactivation  19. Tournament ops D (match chat)
--   6. Seed missions          13. Leaderboard periods   20. Tournament ops E (results)
--   7. Realtime publication   14. Tournaments
--   (Mission fees, platform settings, deposit/membership requests are inline,
--   unnumbered, added earlier — search for their CREATE TABLE statements.)
--
-- ⚠ KNOWN GAP: public.is_admin() is called by ~30 RLS policies throughout this
-- file but is never DEFINED here — it only exists in the live Supabase project
-- this schema was built against, created directly in the SQL editor before this
-- file became the source of truth. Running this on a fresh project WILL fail
-- until you define it yourself first. See README.md "Getting started" for a
-- reconstructed definition (verify against the live project's actual one if
-- you have access to it).
--
-- Full architecture/feature docs: README.md
-- ============================================================================

-- CLEANUP / RESET SCRIPT (Drops existing tables, triggers, and functions to allow a fresh run)
DROP TRIGGER IF EXISTS on_mission_approved ON public.mission_attempts;
DROP FUNCTION IF EXISTS public.process_approved_mission();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.payout_requests CASCADE;
DROP TABLE IF EXISTS public.mission_attempts CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- 1. PROFILES TABLE (linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT UNIQUE,
    is_phone_verified BOOLEAN DEFAULT false NOT NULL,
    role TEXT DEFAULT 'player'::text CHECK (role IN ('player', 'admin', 'moderator')) NOT NULL,
    kyc_status TEXT DEFAULT 'unverified'::text CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'suspended')) NOT NULL,
    membership_tier TEXT DEFAULT 'free'::text CHECK (membership_tier IN ('free', 'bronze', 'gold')) NOT NULL,
    daily_mission_limit INTEGER DEFAULT 3 NOT NULL, -- 3 for free, 5 for bronze, 9 for gold
    xp INTEGER DEFAULT 0 NOT NULL, -- Leaderboard points
    missions_completed INTEGER DEFAULT 0 NOT NULL, -- Total successful missions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. WALLETS TABLE (linked to profiles)
CREATE TABLE public.wallets (
    id UUID REFERENCES public.profiles ON DELETE CASCADE PRIMARY KEY,
    balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Wallets Policies (Users can only see their own wallet balance)
CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own wallet" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = id);


-- AUTOMATIC PROFILE & WALLET CREATION ON SIGNUP (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.wallets (id, balance)
    VALUES (new.id, 0.00);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. MISSIONS TABLE
CREATE TABLE public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    game TEXT NOT NULL, -- e.g., 'MLBB', 'PUBG'
    reward_amount NUMERIC(10, 2) NOT NULL,
    xp_reward INTEGER DEFAULT 50 NOT NULL,
    rules TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Medium'::text CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Missions Policies (Anyone logged in or anonymous can view active missions)
CREATE POLICY "Active missions are viewable by everyone" ON public.missions
    FOR SELECT USING (is_active = true);


-- 4. MISSION ATTEMPTS TABLE (Stores starts, timers, submissions, and status)
CREATE TABLE public.mission_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
    mission_id UUID REFERENCES public.missions ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- set to started_at + 30 minutes
    screenshot_url TEXT, -- uploaded image path, nullable until they submit proof
    status TEXT DEFAULT 'active'::text CHECK (status IN ('active', 'pending_review', 'approved', 'rejected', 'expired')) NOT NULL,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.mission_attempts ENABLE ROW LEVEL SECURITY;

-- Mission Attempts Policies
CREATE POLICY "Users can view their own attempts" ON public.mission_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can start their own attempts" ON public.mission_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can submit proof for their own attempts" ON public.mission_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Tracks whether an attempt was a paid entry (accepted after the player's free daily limit was used up)
ALTER TABLE public.mission_attempts ADD COLUMN IF NOT EXISTS is_paid_entry BOOLEAN DEFAULT false NOT NULL;


-- AUTOMATIC INSTANT PAYOUT ON MISSION APPROVAL (Trigger)
CREATE OR REPLACE FUNCTION public.process_approved_mission()
RETURNS TRIGGER AS $$
DECLARE
    v_reward NUMERIC(10,2);
    v_xp INTEGER;
END;
$$ -- Note: Declared variables but logic is finished below
-- Actual logic:
CREATE OR REPLACE FUNCTION public.process_approved_mission()
RETURNS TRIGGER AS $$
DECLARE
    v_reward NUMERIC(10,2);
    v_xp INTEGER;
BEGIN
    -- Only run if the status was changed to 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Get the reward and XP details from the missions table
        SELECT reward_amount, xp_reward INTO v_reward, v_xp
        FROM public.missions
        WHERE id = NEW.mission_id;
        
        -- Update the user's wallet balance
        UPDATE public.wallets
        SET balance = balance + v_reward,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Update the user's profile (XP and completed mission count)
        UPDATE public.profiles
        SET xp = xp + v_xp,
            missions_completed = missions_completed + 1
        WHERE id = NEW.user_id;

        -- Set the resolution timestamp
        NEW.submitted_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_mission_approved
    BEFORE UPDATE ON public.mission_attempts
    FOR EACH ROW EXECUTE FUNCTION public.process_approved_mission();


-- 5. PAYOUT REQUESTS TABLE
CREATE TABLE public.payout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('esewa', 'paypal')) NOT NULL,
    payment_details TEXT NOT NULL, -- eSewa mobile number or PayPal email
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'processed', 'cancelled', 'rejected')) NOT NULL,
    admin_notes TEXT, -- Admin explanation if rejected/cancelled
    transaction_id TEXT, -- eSewa/PayPal payment reference ID once processed
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Payout Requests Policies
CREATE POLICY "Users can view their own payout requests" ON public.payout_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payout requests" ON public.payout_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Defense in depth: a wallet can never go negative, no matter what code path touches it
ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);

-- ATOMIC PAYOUT PROCESSING (avoids the classic read-balance-then-write-balance race condition)
CREATE OR REPLACE FUNCTION public.process_payout(
    p_payout_id UUID,
    p_transaction_id TEXT
)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_amount NUMERIC(10,2);
    v_method TEXT;
    v_status TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can process payouts';
    END IF;

    -- Lock the payout row so two admins can't process the same request twice at once
    SELECT user_id, amount, payment_method, status
    INTO v_user_id, v_amount, v_method, v_status
    FROM public.payout_requests
    WHERE id = p_payout_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payout request not found';
    END IF;

    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'This payout request has already been resolved';
    END IF;

    -- Atomic, row-locked deduction: re-checks the balance at write time, not read time
    UPDATE public.wallets
    SET balance = balance - v_amount, updated_at = NOW()
    WHERE id = v_user_id AND balance >= v_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    UPDATE public.payout_requests
    SET status = 'processed',
        transaction_id = p_transaction_id,
        admin_notes = 'Paid successfully via ' || UPPER(v_method)
    WHERE id = p_payout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- MISSION ENTRY FEES (pay-to-play beyond a player's free daily mission limit)
CREATE TABLE IF NOT EXISTS public.mission_difficulty_fees (
    difficulty TEXT PRIMARY KEY CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
    fee NUMERIC(10,2) NOT NULL
);

ALTER TABLE public.mission_difficulty_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view mission fees" ON public.mission_difficulty_fees;
CREATE POLICY "Anyone can view mission fees" ON public.mission_difficulty_fees
    FOR SELECT USING (true);

INSERT INTO public.mission_difficulty_fees (difficulty, fee) VALUES
    ('Easy', 10.00),
    ('Medium', 15.00),
    ('Hard', 20.00),
    ('Expert', 25.00)
ON CONFLICT (difficulty) DO UPDATE SET fee = EXCLUDED.fee;

-- ATOMIC MISSION START: enforces the daily free-mission limit, the 2-attempts-per-mission-per-day
-- cap, and the pay-to-play entry fee all as one server-side operation, so none of these rules
-- can be bypassed or raced by calling the client's insert directly.
CREATE OR REPLACE FUNCTION public.start_mission_attempt(p_mission_id UUID)
RETURNS public.mission_attempts AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_daily_limit INTEGER;
    v_is_banned BOOLEAN;
    v_today_start TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE 'Asia/Kathmandu') AT TIME ZONE 'Asia/Kathmandu';
    v_attempts_today INTEGER;
    v_same_mission_today INTEGER;
    v_difficulty TEXT;
    v_fee NUMERIC(10,2);
    v_is_paid BOOLEAN := false;
    v_new_attempt public.mission_attempts;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT daily_mission_limit, is_banned INTO v_daily_limit, v_is_banned
    FROM public.profiles WHERE id = v_user_id;

    IF v_is_banned THEN
        RAISE EXCEPTION 'Your account has been banned from participating in missions.';
    END IF;

    SELECT COUNT(*) INTO v_attempts_today
    FROM public.mission_attempts
    WHERE user_id = v_user_id AND started_at >= v_today_start;

    SELECT COUNT(*) INTO v_same_mission_today
    FROM public.mission_attempts
    WHERE user_id = v_user_id AND mission_id = p_mission_id AND started_at >= v_today_start;

    IF v_same_mission_today >= 2 THEN
        RAISE EXCEPTION 'You have already attempted this mission the maximum number of times today.';
    END IF;

    SELECT difficulty INTO v_difficulty
    FROM public.missions
    WHERE id = p_mission_id AND is_active = true;

    IF v_difficulty IS NULL THEN
        RAISE EXCEPTION 'Mission not found or is no longer active.';
    END IF;

    IF v_attempts_today >= v_daily_limit THEN
        v_is_paid := true;

        SELECT fee INTO v_fee FROM public.mission_difficulty_fees WHERE difficulty = v_difficulty;

        UPDATE public.wallets
        SET balance = balance - v_fee, updated_at = NOW()
        WHERE id = v_user_id AND balance >= v_fee;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient wallet balance to pay the Rs. % entry fee for this mission.', v_fee;
        END IF;
    END IF;

    INSERT INTO public.mission_attempts (user_id, mission_id, expires_at, status, is_paid_entry)
    VALUES (v_user_id, p_mission_id, NOW() + INTERVAL '30 minutes', 'active', v_is_paid)
    RETURNING * INTO v_new_attempt;

    RETURN v_new_attempt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- PLATFORM SETTINGS (small key/value config, e.g. where players send deposit money)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings
    FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings
    FOR UPDATE USING (public.is_admin());

INSERT INTO public.platform_settings (key, value) VALUES
    ('esewa_deposit_number', 'REPLACE_WITH_YOUR_REAL_ESEWA_NUMBER'),
    ('paypal_deposit_email', 'REPLACE_WITH_YOUR_REAL_PAYPAL_EMAIL')
ON CONFLICT (key) DO NOTHING;


-- DEPOSIT REQUESTS (players adding money: manual send + admin verification, mirrors payout_requests)
CREATE TABLE IF NOT EXISTS public.deposit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('esewa', 'paypal')) NOT NULL,
    reference_note TEXT NOT NULL, -- transaction ID / reference the player used when sending money
    proof_url TEXT, -- optional screenshot proof of the payment
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own deposit requests" ON public.deposit_requests;
CREATE POLICY "Users can view their own deposit requests" ON public.deposit_requests
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own deposit requests" ON public.deposit_requests;
CREATE POLICY "Users can create their own deposit requests" ON public.deposit_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update deposit requests" ON public.deposit_requests;
CREATE POLICY "Admins can update deposit requests" ON public.deposit_requests
    FOR UPDATE USING (public.is_admin());

-- Storage bucket for deposit proof screenshots (same pattern as proof_photo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit_proof', 'deposit_proof', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own deposit proof" ON storage.objects;
CREATE POLICY "Users can upload their own deposit proof"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'deposit_proof'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own deposit proof" ON storage.objects;
CREATE POLICY "Users can view their own deposit proof"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'deposit_proof'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

-- ATOMIC DEPOSIT APPROVAL (credits the wallet only once, only by an admin)
CREATE OR REPLACE FUNCTION public.approve_deposit(p_deposit_id UUID)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_amount NUMERIC(10,2);
    v_status TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can approve deposits';
    END IF;

    SELECT user_id, amount, status INTO v_user_id, v_amount, v_status
    FROM public.deposit_requests
    WHERE id = p_deposit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit request not found';
    END IF;

    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'This deposit request has already been resolved';
    END IF;

    UPDATE public.wallets
    SET balance = balance + v_amount, updated_at = NOW()
    WHERE id = v_user_id;

    UPDATE public.deposit_requests
    SET status = 'approved'
    WHERE id = p_deposit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- MEMBERSHIP UPGRADE REQUESTS (manual pay + admin verification, mirrors deposit_requests)
CREATE TABLE IF NOT EXISTS public.membership_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
    tier TEXT CHECK (tier IN ('bronze', 'gold')) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('esewa', 'paypal')) NOT NULL,
    reference_note TEXT NOT NULL,
    proof_url TEXT,
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own membership requests" ON public.membership_requests;
CREATE POLICY "Users can view their own membership requests" ON public.membership_requests
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own membership requests" ON public.membership_requests;
CREATE POLICY "Users can create their own membership requests" ON public.membership_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update membership requests" ON public.membership_requests;
CREATE POLICY "Admins can update membership requests" ON public.membership_requests
    FOR UPDATE USING (public.is_admin());

-- Storage bucket for membership payment proof screenshots (same pattern as deposit_proof)
INSERT INTO storage.buckets (id, name, public)
VALUES ('membership_proof', 'membership_proof', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own membership proof" ON storage.objects;
CREATE POLICY "Users can upload their own membership proof"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'membership_proof'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own membership proof" ON storage.objects;
CREATE POLICY "Users can view their own membership proof"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'membership_proof'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

-- ATOMIC MEMBERSHIP UPGRADE APPROVAL (only by an admin, only once)
CREATE OR REPLACE FUNCTION public.approve_membership_upgrade(p_request_id UUID)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_tier TEXT;
    v_status TEXT;
    v_limit INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can approve membership upgrades';
    END IF;

    SELECT user_id, tier, status INTO v_user_id, v_tier, v_status
    FROM public.membership_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Membership request not found';
    END IF;

    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'This membership request has already been resolved';
    END IF;

    v_limit := CASE v_tier WHEN 'bronze' THEN 5 WHEN 'gold' THEN 9 ELSE 3 END;

    UPDATE public.profiles
    SET membership_tier = v_tier, daily_mission_limit = v_limit
    WHERE id = v_user_id;

    UPDATE public.membership_requests
    SET status = 'approved'
    WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- INSTANT MEMBERSHIP UPGRADE PAID FROM WALLET BALANCE (no admin verification needed,
-- since the balance itself was already verified when it was credited)
CREATE OR REPLACE FUNCTION public.upgrade_membership_with_wallet(p_tier TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_price NUMERIC(10,2);
    v_limit INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_tier NOT IN ('bronze', 'gold') THEN
        RAISE EXCEPTION 'Invalid tier';
    END IF;

    v_price := CASE p_tier WHEN 'bronze' THEN 499.00 WHEN 'gold' THEN 999.00 END;
    v_limit := CASE p_tier WHEN 'bronze' THEN 5 WHEN 'gold' THEN 9 END;

    UPDATE public.wallets
    SET balance = balance - v_price, updated_at = NOW()
    WHERE id = v_user_id AND balance >= v_price;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient wallet balance for instant upgrade.';
    END IF;

    UPDATE public.profiles
    SET membership_tier = p_tier, daily_mission_limit = v_limit
    WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. SEED DEFAULT MISSIONS
INSERT INTO public.missions (id, title, description, game, reward_amount, xp_reward, rules, difficulty, is_active)
VALUES
    -- Mobile Legends (MLBB)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Savage Dominator', 'Get a Savage in a Classic or Ranked MLBB match. You must upload a screenshot of your post-game scoreboard showing your Savage count and IGN.', 'Mobile Legends', 150.00, 100, 'Ranked or Classic match only. No Custom/AI matches. Date and name must be visible.', 'Expert', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'MVP Challenger', 'Get MVP in a Ranked MLBB match. Show the end-game MVP screen with your username clearly highlighted.', 'Mobile Legends', 50.00, 50, 'Ranked match only. Must win the game and receive the MVP medal.', 'Easy', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Triple Kill Streak', 'Get a Triple Kill in a Ranked or Classic MLBB match. Upload the kill notification screenshot.', 'Mobile Legends', 40.00, 40, 'Ranked or Classic match only. Kill feed must clearly show Triple Kill and your IGN.', 'Medium', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Turret Destroyer', 'Destroy 3 or more turrets solo in a single Ranked MLBB match. Show the end-game stats screen with turret count.', 'Mobile Legends', 70.00, 70, 'Ranked match only. Turret destruction count must be visible on the post-game summary.', 'Hard', true),

    -- PUBG Mobile
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Chicken Dinner Squad', 'Win a Classic Ranked Squad match in PUBG Mobile. Show the final screen showing #1 Winner Winner Chicken Dinner with your name.', 'PUBG Mobile', 100.00, 75, 'Classic squad matches only. Must finish #1 in the match.', 'Medium', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Headshot Specialist', 'Get 5 or more headshot kills in a single Classic match in PUBG Mobile. Upload match summary stats showing headshot count.', 'PUBG Mobile', 80.00, 60, 'Classic match only. Headshots must be clearly shown on the end match screen.', 'Hard', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Solo Survivor', 'Win a Classic Solo match in PUBG Mobile. Show the final #1 Winner screen with your username.', 'PUBG Mobile', 120.00, 90, 'Classic solo matches only. Must finish #1 in the match.', 'Expert', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Kill Streak Rookie', 'Get 5 or more kills in any Classic PUBG Mobile match. Upload the end-game scoreboard showing your kill count.', 'PUBG Mobile', 35.00, 35, 'Any Classic match mode. Kill count and username must be visible.', 'Easy', true),

    -- Others (Free Fire, Call of Duty Mobile)
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Booyah Bringer', 'Win a Battle Royale match in Free Fire. Show the final Booyah screen with your username.', 'Free Fire', 90.00, 65, 'Battle Royale mode only. Booyah screen and IGN must be visible.', 'Medium', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Headshot Hero', 'Get 5 or more headshot kills in a single Free Fire match. Upload the post-match stats screen.', 'Free Fire', 75.00, 55, 'Any ranked or classic match. Headshot count must be clearly visible.', 'Hard', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Domination Ace', 'Finish top score in a Call of Duty Mobile Domination match. Show the post-match scoreboard.', 'Call of Duty Mobile', 110.00, 85, 'Multiplayer Domination mode only. Top score and username must be visible.', 'Expert', true),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Quick Scoper', 'Get 3 or more sniper kills in a single Call of Duty Mobile match. Upload the end-match summary.', 'Call of Duty Mobile', 30.00, 30, 'Any multiplayer match. Sniper kill count must be visible on the scoreboard.', 'Easy', true)
ON CONFLICT (id) DO NOTHING;


-- 7. REALTIME: let the client subscribe to live wallet balance and mission
-- attempt status changes (e.g. an admin approving a submission/payout while
-- the player still has the tab open) instead of only updating on refresh.
-- Existing RLS policies ("Users can view their own wallet" / "Users can view
-- their own attempts") already scope what each subscriber can see.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'wallets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'mission_attempts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_attempts;
    END IF;
END $$;


-- 8. IN-GAME ID LINKING: players link a game + in-game user ID to their profile.
-- No official third-party API exists to verify these live (MLBB/PUBG/Free Fire/
-- COD Mobile don't expose one), so this mirrors the existing KYC pattern: player
-- submits, status starts 'pending', admin reviews and marks verified/rejected.
CREATE TABLE IF NOT EXISTS public.game_id_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    game_type TEXT NOT NULL,
    in_game_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'verified', 'rejected')) NOT NULL,
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, game_type)
);

ALTER TABLE public.game_id_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own game id links" ON public.game_id_links;
CREATE POLICY "Users can view their own game id links" ON public.game_id_links
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update game id links" ON public.game_id_links;
CREATE POLICY "Admins can update game id links" ON public.game_id_links
    FOR UPDATE USING (public.is_admin());

-- Client never inserts/upserts directly (no INSERT policy) — this function is the
-- only write path, so a player can never set their own status to 'verified'.
CREATE OR REPLACE FUNCTION public.link_game_id(p_game_type TEXT, p_in_game_id TEXT)
RETURNS public.game_id_links AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_result public.game_id_links;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF trim(p_in_game_id) = '' THEN
        RAISE EXCEPTION 'In-game ID cannot be empty';
    END IF;

    INSERT INTO public.game_id_links (user_id, game_type, in_game_id, status, admin_notes, submitted_at)
    VALUES (v_user_id, p_game_type, trim(p_in_game_id), 'pending', NULL, NOW())
    ON CONFLICT (user_id, game_type)
    DO UPDATE SET in_game_id = EXCLUDED.in_game_id, status = 'pending', admin_notes = NULL, submitted_at = NOW()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. NOTIFICATIONS: in-app only (no push/email). Two write paths, both
-- SECURITY DEFINER so a player can never insert/fake a notification for
-- themselves or anyone else — there is no client-facing INSERT policy.
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'broadcast'::text CHECK (category IN ('broadcast', 'mission', 'payout', 'deposit', 'membership')) NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their own notifications read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications read" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Path 1: admin broadcast (e.g. new tournament), fans out one row per player
-- so read-state can be tracked per-user with the same simple table/policy.
CREATE OR REPLACE FUNCTION public.broadcast_notification(p_title TEXT, p_body TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can send broadcast notifications';
    END IF;

    INSERT INTO public.notifications (user_id, title, body, category)
    SELECT id, p_title, p_body, 'broadcast' FROM public.profiles;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Path 2: automatic per-user status-change notifications. Separate AFTER
-- triggers (not folded into process_approved_mission/approve_deposit/etc.)
-- so the already-working money-moving logic in those functions stays untouched.
CREATE OR REPLACE FUNCTION public.notify_mission_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Mission approved!', 'Your mission submission was approved and the reward has been credited to your wallet.', 'mission', NEW.id);
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Mission rejected', COALESCE('Your mission submission was rejected: ' || NEW.rejection_reason, 'Your mission submission was rejected.'), 'mission', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_mission_status_notify ON public.mission_attempts;
CREATE TRIGGER on_mission_status_notify
    AFTER UPDATE ON public.mission_attempts
    FOR EACH ROW EXECUTE FUNCTION public.notify_mission_status_change();

CREATE OR REPLACE FUNCTION public.notify_payout_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'processed' AND OLD.status != 'processed' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Payout sent', 'Your withdrawal of Rs. ' || NEW.amount || ' has been processed.', 'payout', NEW.id);
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Payout rejected', COALESCE('Your withdrawal request was rejected: ' || NEW.admin_notes, 'Your withdrawal request was rejected.'), 'payout', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payout_status_notify ON public.payout_requests;
CREATE TRIGGER on_payout_status_notify
    AFTER UPDATE ON public.payout_requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_payout_status_change();

CREATE OR REPLACE FUNCTION public.notify_deposit_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Deposit approved', 'Your deposit of Rs. ' || NEW.amount || ' has been added to your wallet.', 'deposit', NEW.id);
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Deposit rejected', COALESCE('Your deposit request was rejected: ' || NEW.admin_notes, 'Your deposit request was rejected.'), 'deposit', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_deposit_status_notify ON public.deposit_requests;
CREATE TRIGGER on_deposit_status_notify
    AFTER UPDATE ON public.deposit_requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_deposit_status_change();

CREATE OR REPLACE FUNCTION public.notify_membership_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Membership upgraded', 'Your upgrade to ' || UPPER(NEW.tier) || ' has been approved.', 'membership', NEW.id);
    ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO public.notifications (user_id, title, body, category, related_id)
        VALUES (NEW.user_id, 'Membership request rejected', COALESCE('Your upgrade request was rejected: ' || NEW.admin_notes, 'Your upgrade request was rejected.'), 'membership', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_membership_status_notify ON public.membership_requests;
CREATE TRIGGER on_membership_status_notify
    AFTER UPDATE ON public.membership_requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_membership_status_change();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;


-- 10. CUSTOMER SUPPORT: simple ticket queue, no outbound email sending (that
-- needs an Edge Function + email provider, deferred per notes.txt).
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    status TEXT DEFAULT 'open'::text CHECK (status IN ('open', 'in_progress', 'resolved')) NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own support tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can create their own support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update support tickets" ON public.support_tickets;
CREATE POLICY "Admins can update support tickets" ON public.support_tickets
    FOR UPDATE USING (public.is_admin());


-- 11. RATE US / FEEDBACK: fire-and-forget star rating + optional comment.
-- Public/testimonial-style: readable by everyone including logged-out
-- visitors, all ratings shown unfiltered (no moderation gate) -- matches
-- the existing "Public profiles are viewable by everyone" / "Active
-- missions are viewable by everyone" pattern already used elsewhere.
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;
CREATE POLICY "Users can insert their own feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Feedback is viewable by everyone" ON public.feedback;
CREATE POLICY "Feedback is viewable by everyone" ON public.feedback
    FOR SELECT USING (true);


-- 12. DELETE ACCOUNT: true permanent deletion of the auth.users row needs the
-- Supabase service-role key, which must run server-side (an Edge Function) --
-- not built yet (see notes.txt). Until then, "delete account" is self-service
-- deactivation: blocks login, recoverable by an admin. Mirrors the existing
-- is_banned pattern/admin-update policy already used for banning players.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT false NOT NULL;

-- Explicit admin-update policy for profiles: this already had to exist live for
-- the existing ban/unban feature to work (it updates profiles.is_banned as the
-- admin, not the target user), but schema.sql never defined it -- same
-- undocumented-gap issue as is_admin() itself. Making it explicit here so
-- reactivating a deactivated account (below) doesn't silently depend on
-- unverified live state. Harmless if a live policy already covers this.
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.deactivate_own_account()
RETURNS void AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    UPDATE public.profiles SET is_deactivated = true WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 13. LEADERBOARD PERIODS: weekly/monthly are rolling windows (last 7 / 30
-- days from now), not calendar week/month, to keep the boundary logic simple
-- and avoid month-length/timezone edge cases. 'all' matches the existing
-- lifetime-total leaderboard (profiles.xp), unchanged in behavior.
-- SECURITY DEFINER because regular users can only SELECT their own rows in
-- mission_attempts (RLS) -- this aggregates across everyone but only returns
-- the same public fields the existing leaderboard already exposes.
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_period TEXT DEFAULT 'all')
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    avatar_url TEXT,
    xp BIGINT,
    missions_completed BIGINT
) AS $$
BEGIN
    IF p_period = 'all' THEN
        RETURN QUERY
        SELECT p.id, p.display_name, p.avatar_url, p.xp::BIGINT, p.missions_completed::BIGINT
        FROM public.profiles p
        ORDER BY p.xp DESC, p.missions_completed DESC
        LIMIT 100;
    ELSE
        RETURN QUERY
        SELECT
            p.id,
            p.display_name,
            p.avatar_url,
            COALESCE(SUM(m.xp_reward), 0)::BIGINT AS xp,
            COUNT(ma.id)::BIGINT AS missions_completed
        FROM public.mission_attempts ma
        JOIN public.missions m ON m.id = ma.mission_id
        JOIN public.profiles p ON p.id = ma.user_id
        WHERE ma.status = 'approved'
          AND ma.submitted_at >= (
              CASE p_period
                  WHEN 'week' THEN NOW() - INTERVAL '7 days'
                  WHEN 'month' THEN NOW() - INTERVAL '30 days'
                  ELSE NOW() - INTERVAL '100 years'
              END
          )
        GROUP BY p.id, p.display_name, p.avatar_url
        ORDER BY xp DESC, missions_completed DESC
        LIMIT 100;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 14. TOURNAMENTS: admin-hosted, in-app registration, live registered_count.
-- Registration only ever happens through register_for_tournament() (no direct
-- INSERT policy) so the MLBB-roster-of-5 / PUBG-solo shape can't be bypassed.
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type TEXT NOT NULL CHECK (game_type IN ('MLBB', 'PUBG')),
    title TEXT NOT NULL,
    description TEXT,
    prize_pool NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_participants INTEGER NOT NULL,
    registration_unit TEXT NOT NULL CHECK (registration_unit IN ('team', 'player')),
    status TEXT DEFAULT 'upcoming'::text CHECK (status IN ('upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled')) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    livestream_url TEXT,
    rules TEXT,
    registered_count INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.profiles,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tournaments are viewable by everyone" ON public.tournaments;
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create tournaments" ON public.tournaments;
CREATE POLICY "Admins can create tournaments" ON public.tournaments
    FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update tournaments" ON public.tournaments;
CREATE POLICY "Admins can update tournaments" ON public.tournaments
    FOR UPDATE USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    team_name TEXT,
    roster TEXT[],
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tournament registrations" ON public.tournament_registrations;
CREATE POLICY "Users can view their own tournament registrations" ON public.tournament_registrations
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can remove tournament registrations" ON public.tournament_registrations;
CREATE POLICY "Admins can remove tournament registrations" ON public.tournament_registrations
    FOR DELETE USING (public.is_admin());

-- The only write path: validates team/roster shape against the tournament's
-- game_type before inserting, and blocks registering when it isn't open.
CREATE OR REPLACE FUNCTION public.register_for_tournament(
    p_tournament_id UUID,
    p_team_name TEXT DEFAULT NULL,
    p_roster TEXT[] DEFAULT NULL
)
RETURNS public.tournament_registrations AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_tournament public.tournaments;
    v_result public.tournament_registrations;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_tournament FROM public.tournaments WHERE id = p_tournament_id;

    IF v_tournament IS NULL THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;

    IF v_tournament.status != 'registration_open' THEN
        RAISE EXCEPTION 'Registration is not open for this tournament';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.tournament_registrations
        WHERE tournament_id = p_tournament_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'You are already registered for this tournament';
    END IF;

    IF v_tournament.registration_unit = 'team' THEN
        IF p_team_name IS NULL OR trim(p_team_name) = '' THEN
            RAISE EXCEPTION 'Team name is required';
        END IF;
        IF p_roster IS NULL OR COALESCE(array_length(p_roster, 1), 0) != 5 THEN
            RAISE EXCEPTION 'A full 5-player roster is required';
        END IF;
    ELSE
        IF p_team_name IS NOT NULL OR p_roster IS NOT NULL THEN
            RAISE EXCEPTION 'This tournament does not use team registration';
        END IF;
    END IF;

    INSERT INTO public.tournament_registrations (tournament_id, user_id, team_name, roster)
    VALUES (p_tournament_id, v_user_id, trim(p_team_name), p_roster)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keeps tournaments.registered_count in sync so the public SELECT on
-- tournaments already carries a live count -- no separate aggregate query.
CREATE OR REPLACE FUNCTION public.update_tournament_registered_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tournaments SET registered_count = registered_count + 1 WHERE id = NEW.tournament_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tournaments SET registered_count = registered_count - 1 WHERE id = OLD.tournament_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_tournament_registration_change ON public.tournament_registrations;
CREATE TRIGGER on_tournament_registration_change
    AFTER INSERT OR DELETE ON public.tournament_registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_tournament_registered_count();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournaments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
    END IF;
END $$;

-- Seed: the two launch tournaments.
INSERT INTO public.tournaments (id, game_type, title, description, prize_pool, min_participants, registration_unit, status, rules)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'MLBB', 'MissionQuest MLBB Championship', 'The first official MissionQuest Mobile Legends: Bang Bang tournament. Single-elimination bracket, best of 3.', 50000.00, 76, 'team', 'registration_open', 'Teams must register exactly 5 players. All matches are best-of-3. Check-in required 30 minutes before your scheduled match, or you forfeit.'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'PUBG', 'MissionQuest PUBG Showdown', 'The first official MissionQuest PUBG Mobile tournament. Classic mode, points-based ranking across multiple matches.', 50000.00, 500, 'player', 'registration_open', 'Solo registration. Multiple qualifying matches, cumulative points determine the winner. Teaming with eliminated players is not allowed.')
ON CONFLICT (id) DO NOTHING;


-- 15. TOURNAMENT BANNER IMAGES: admin-uploaded poster/graphic per tournament,
-- shown on the tournament card. Public bucket (this is marketing content,
-- same visibility as the tournaments table itself) but only admins can write.
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS banner_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament_banners', 'tournament_banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Tournament banners are viewable by everyone" ON storage.objects;
CREATE POLICY "Tournament banners are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament_banners');

DROP POLICY IF EXISTS "Admins can upload tournament banners" ON storage.objects;
CREATE POLICY "Admins can upload tournament banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tournament_banners' AND public.is_admin());


-- 16. TOURNAMENT OPS PHASE A: verified-gated registration + real team rosters.
-- Replaces the old free-typed `roster TEXT[]` (no registrations existed yet, so
-- this is a clean cut, not a migration) with a proper team_members table, so a
-- captain builds their roster from real, game-ID-verified players -- and so
-- "no player on two teams" is enforced by a single UNIQUE constraint rather than
-- application logic.

-- tournaments.game_type ('MLBB'|'PUBG') and game_id_links.game_type (free text
-- matching the app's GAME_OPTIONS, e.g. 'Mobile Legends') use different
-- vocabularies -- this is the single place that maps between them.
CREATE OR REPLACE FUNCTION public.tournament_game_id_type(p_tournament_game_type TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE p_tournament_game_type
        WHEN 'MLBB' THEN 'Mobile Legends'
        WHEN 'PUBG' THEN 'PUBG Mobile'
        ELSE p_tournament_game_type
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE IF NOT EXISTS public.tournament_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.tournament_registrations ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    is_captain BOOLEAN DEFAULT false NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_team_members ENABLE ROW LEVEL SECURITY;

-- Public, same visibility as the tournaments/registrations themselves -- once a
-- bracket exists, spectators should be able to see who's on which team.
DROP POLICY IF EXISTS "Tournament team members are viewable by everyone" ON public.tournament_team_members;
CREATE POLICY "Tournament team members are viewable by everyone" ON public.tournament_team_members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can remove tournament team members" ON public.tournament_team_members;
CREATE POLICY "Admins can remove tournament team members" ON public.tournament_team_members
    FOR DELETE USING (public.is_admin());

-- Team names are the same kind of public info now that rosters are public too.
DROP POLICY IF EXISTS "Users can view their own tournament registrations" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Tournament registrations are viewable by everyone" ON public.tournament_registrations;
CREATE POLICY "Tournament registrations are viewable by everyone" ON public.tournament_registrations
    FOR SELECT USING (true);

-- Old free-text roster column is fully superseded by tournament_team_members.
ALTER TABLE public.tournament_registrations DROP COLUMN IF EXISTS roster;

-- Rewritten: no longer accepts a roster array; validates the registrant's own
-- game ID is verified; always inserts the registrant as team_members captain
-- (solo/PUBG registrants are their own 1-person "team" for a uniform model).
-- Explicit DROP first: the old 3-arg signature (..., p_roster TEXT[]) is a
-- different overload as far as Postgres is concerned, so CREATE OR REPLACE
-- alone would leave it callable side-by-side instead of retiring it.
DROP FUNCTION IF EXISTS public.register_for_tournament(UUID, TEXT, TEXT[]);
CREATE OR REPLACE FUNCTION public.register_for_tournament(
    p_tournament_id UUID,
    p_team_name TEXT DEFAULT NULL
)
RETURNS public.tournament_registrations AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_tournament public.tournaments;
    v_game_id_type TEXT;
    v_result public.tournament_registrations;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_tournament FROM public.tournaments WHERE id = p_tournament_id;

    IF v_tournament IS NULL THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;

    IF v_tournament.status != 'registration_open' THEN
        RAISE EXCEPTION 'Registration is not open for this tournament';
    END IF;

    v_game_id_type := public.tournament_game_id_type(v_tournament.game_type);

    IF NOT EXISTS (
        SELECT 1 FROM public.game_id_links
        WHERE user_id = v_user_id AND game_type = v_game_id_type AND status = 'verified'
    ) THEN
        RAISE EXCEPTION 'Link and verify your % game ID in your Profile before registering', v_game_id_type;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.tournament_registrations
        WHERE tournament_id = p_tournament_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'You are already registered for this tournament';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.tournament_team_members
        WHERE tournament_id = p_tournament_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'You are already on a team in this tournament';
    END IF;

    IF v_tournament.registration_unit = 'team' AND (p_team_name IS NULL OR trim(p_team_name) = '') THEN
        RAISE EXCEPTION 'Team name is required';
    END IF;

    IF v_tournament.registration_unit = 'player' AND p_team_name IS NOT NULL THEN
        RAISE EXCEPTION 'This tournament does not use team registration';
    END IF;

    INSERT INTO public.tournament_registrations (tournament_id, user_id, team_name)
    VALUES (
        p_tournament_id,
        v_user_id,
        CASE WHEN v_tournament.registration_unit = 'team' THEN trim(p_team_name) ELSE NULL END
    )
    RETURNING * INTO v_result;

    INSERT INTO public.tournament_team_members (tournament_id, registration_id, user_id, is_captain)
    VALUES (p_tournament_id, v_result.id, v_user_id, true);

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Regular users can't otherwise see other users' game_id_links (RLS is
-- own-row-only) -- this is the only way a captain can find eligible players.
-- Excludes anyone already on a team in this tournament.
CREATE OR REPLACE FUNCTION public.search_verified_players(p_tournament_id UUID, p_query TEXT DEFAULT '')
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    avatar_url TEXT,
    in_game_id TEXT
) AS $$
DECLARE
    v_tournament public.tournaments;
    v_game_id_type TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_tournament FROM public.tournaments WHERE id = p_tournament_id;
    IF v_tournament IS NULL THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;

    v_game_id_type := public.tournament_game_id_type(v_tournament.game_type);

    RETURN QUERY
    SELECT p.id, p.display_name, p.avatar_url, g.in_game_id
    FROM public.profiles p
    JOIN public.game_id_links g ON g.user_id = p.id
    WHERE g.game_type = v_game_id_type
      AND g.status = 'verified'
      AND p.display_name ILIKE '%' || p_query || '%'
      AND NOT EXISTS (
          SELECT 1 FROM public.tournament_team_members ttm
          WHERE ttm.tournament_id = p_tournament_id AND ttm.user_id = p.id
      )
    ORDER BY p.display_name
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Caller must be the registration's captain; re-validates the 5-player cap and
-- the verified-game-ID requirement server-side (never trust the search RPC's
-- filtering alone -- it's just for UX).
CREATE OR REPLACE FUNCTION public.add_team_member(p_registration_id UUID, p_user_id UUID)
RETURNS public.tournament_team_members AS $$
DECLARE
    v_caller UUID := auth.uid();
    v_registration public.tournament_registrations;
    v_tournament public.tournaments;
    v_game_id_type TEXT;
    v_member_count INTEGER;
    v_result public.tournament_team_members;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_registration FROM public.tournament_registrations WHERE id = p_registration_id;
    IF v_registration IS NULL THEN
        RAISE EXCEPTION 'Registration not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.tournament_team_members
        WHERE registration_id = p_registration_id AND user_id = v_caller AND is_captain = true
    ) THEN
        RAISE EXCEPTION 'Only the team captain can add members';
    END IF;

    SELECT * INTO v_tournament FROM public.tournaments WHERE id = v_registration.tournament_id;

    IF v_tournament.status != 'registration_open' THEN
        RAISE EXCEPTION 'Registration is not open for this tournament';
    END IF;

    SELECT COUNT(*) INTO v_member_count FROM public.tournament_team_members WHERE registration_id = p_registration_id;
    IF v_member_count >= 5 THEN
        RAISE EXCEPTION 'This team already has 5 players';
    END IF;

    v_game_id_type := public.tournament_game_id_type(v_tournament.game_type);

    IF NOT EXISTS (
        SELECT 1 FROM public.game_id_links
        WHERE user_id = p_user_id AND game_type = v_game_id_type AND status = 'verified'
    ) THEN
        RAISE EXCEPTION 'That player does not have a verified game ID for this tournament';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.tournament_team_members
        WHERE tournament_id = v_registration.tournament_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'That player is already on a team in this tournament';
    END IF;

    INSERT INTO public.tournament_team_members (tournament_id, registration_id, user_id, is_captain)
    VALUES (v_registration.tournament_id, p_registration_id, p_user_id, false)
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.remove_team_member(p_team_member_id UUID)
RETURNS void AS $$
DECLARE
    v_caller UUID := auth.uid();
    v_member public.tournament_team_members;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_member FROM public.tournament_team_members WHERE id = p_team_member_id;
    IF v_member IS NULL THEN
        RAISE EXCEPTION 'Team member not found';
    END IF;

    IF v_member.is_captain THEN
        RAISE EXCEPTION 'The captain cannot be removed from their own team.';
    END IF;

    IF NOT public.is_admin() AND NOT EXISTS (
        SELECT 1 FROM public.tournament_team_members
        WHERE registration_id = v_member.registration_id AND user_id = v_caller AND is_captain = true
    ) THEN
        RAISE EXCEPTION 'Only the team captain or an admin can remove members';
    END IF;

    DELETE FROM public.tournament_team_members WHERE id = p_team_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 17. TOURNAMENT OPS PHASE B: bracket & lobby generation.
-- A "match" is either a bracket match (MLBB, 2 participants, single elim) or a
-- lobby (PUBG, ~25 participants, no winner -- just a grouping for a session
-- whose per-player placement/points get entered later, in a future phase).
-- No direct INSERT/UPDATE policy on either table: only the SECURITY DEFINER
-- RPCs below (and a future admin-result RPC) may write to them, same pattern
-- as tournament_registrations having no direct INSERT policy.
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES public.tournaments ON DELETE CASCADE NOT NULL,
    round INTEGER NOT NULL DEFAULT 1,
    label TEXT NOT NULL,
    match_type TEXT NOT NULL CHECK (match_type IN ('bracket', 'lobby')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checkin', 'ready', 'in_progress', 'awaiting_review', 'completed')),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    best_of INTEGER NOT NULL DEFAULT 1,
    winner_registration_id UUID REFERENCES public.tournament_registrations,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tournament matches are viewable by everyone" ON public.tournament_matches;
CREATE POLICY "Tournament matches are viewable by everyone" ON public.tournament_matches
    FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.tournament_match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.tournament_matches ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.tournament_registrations ON DELETE CASCADE NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    result_placement INTEGER,
    result_points INTEGER,
    UNIQUE(match_id, registration_id)
);

ALTER TABLE public.tournament_match_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tournament match participants are viewable by everyone" ON public.tournament_match_participants;
CREATE POLICY "Tournament match participants are viewable by everyone" ON public.tournament_match_participants
    FOR SELECT USING (true);

-- Admin-only. Randomly shuffles all registered teams into round-1 matches.
-- An odd team out gets an automatic "bye" match (1 participant, already
-- completed with them as the winner) so it flows into the same round-advance
-- logic (built in a later phase) as a normal result. If there are only 2
-- teams total, round 1 IS the final, so it's best-of-3 immediately.
CREATE OR REPLACE FUNCTION public.generate_bracket(p_tournament_id UUID)
RETURNS void AS $$
DECLARE
    v_tournament public.tournaments;
    v_reg_ids UUID[];
    v_count INTEGER;
    v_total_matches INTEGER;
    v_match_id UUID;
    v_match_index INTEGER := 0;
    i INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can generate a bracket';
    END IF;

    SELECT * INTO v_tournament FROM public.tournaments WHERE id = p_tournament_id;
    IF v_tournament IS NULL THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;

    IF v_tournament.registration_unit != 'team' THEN
        RAISE EXCEPTION 'This tournament does not use bracket-style matches';
    END IF;

    IF EXISTS (SELECT 1 FROM public.tournament_matches WHERE tournament_id = p_tournament_id) THEN
        RAISE EXCEPTION 'A bracket has already been generated for this tournament';
    END IF;

    SELECT array_agg(id ORDER BY random()) INTO v_reg_ids
    FROM public.tournament_registrations
    WHERE tournament_id = p_tournament_id;

    v_count := COALESCE(array_length(v_reg_ids, 1), 0);

    IF v_count < 2 THEN
        RAISE EXCEPTION 'Need at least 2 registered teams to generate a bracket';
    END IF;

    v_total_matches := CEIL(v_count::numeric / 2)::INTEGER;

    i := 1;
    WHILE i <= v_count LOOP
        v_match_index := v_match_index + 1;

        IF i + 1 <= v_count THEN
            INSERT INTO public.tournament_matches (tournament_id, round, label, match_type, best_of)
            VALUES (
                p_tournament_id,
                1,
                CASE WHEN v_total_matches = 1 THEN 'Final' ELSE 'Round 1 - Match ' || v_match_index END,
                'bracket',
                CASE WHEN v_total_matches = 1 THEN 3 ELSE 1 END
            )
            RETURNING id INTO v_match_id;

            INSERT INTO public.tournament_match_participants (match_id, registration_id)
            VALUES (v_match_id, v_reg_ids[i]), (v_match_id, v_reg_ids[i + 1]);
        ELSE
            INSERT INTO public.tournament_matches (tournament_id, round, label, match_type, best_of, status, winner_registration_id)
            VALUES (p_tournament_id, 1, 'Round 1 - Bye', 'bracket', 1, 'completed', v_reg_ids[i])
            RETURNING id INTO v_match_id;

            INSERT INTO public.tournament_match_participants (match_id, registration_id)
            VALUES (v_match_id, v_reg_ids[i]);
        END IF;

        i := i + 2;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin-only. Randomly shuffles all registered solo players into lobby groups
-- of p_lobby_size (last group may be smaller). No winner/advancement concept
-- for lobbies -- PUBG's rules are cumulative points across matches, entered
-- by the admin per player in a later phase.
CREATE OR REPLACE FUNCTION public.generate_pubg_lobbies(p_tournament_id UUID, p_lobby_size INTEGER DEFAULT 25)
RETURNS void AS $$
DECLARE
    v_tournament public.tournaments;
    v_reg_ids UUID[];
    v_count INTEGER;
    v_match_id UUID;
    v_lobby_index INTEGER := 0;
    v_chunk_end INTEGER;
    i INTEGER;
    j INTEGER;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can generate lobbies';
    END IF;

    SELECT * INTO v_tournament FROM public.tournaments WHERE id = p_tournament_id;
    IF v_tournament IS NULL THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;

    IF v_tournament.registration_unit != 'player' THEN
        RAISE EXCEPTION 'This tournament does not use lobby-style matches';
    END IF;

    IF EXISTS (SELECT 1 FROM public.tournament_matches WHERE tournament_id = p_tournament_id) THEN
        RAISE EXCEPTION 'Lobbies have already been generated for this tournament';
    END IF;

    IF p_lobby_size < 2 THEN
        RAISE EXCEPTION 'Lobby size must be at least 2';
    END IF;

    SELECT array_agg(id ORDER BY random()) INTO v_reg_ids
    FROM public.tournament_registrations
    WHERE tournament_id = p_tournament_id;

    v_count := COALESCE(array_length(v_reg_ids, 1), 0);

    IF v_count < 2 THEN
        RAISE EXCEPTION 'Need at least 2 registered players to generate lobbies';
    END IF;

    i := 1;
    WHILE i <= v_count LOOP
        v_lobby_index := v_lobby_index + 1;
        v_chunk_end := LEAST(i + p_lobby_size - 1, v_count);

        INSERT INTO public.tournament_matches (tournament_id, round, label, match_type)
        VALUES (p_tournament_id, 1, 'Lobby ' || v_lobby_index, 'lobby')
        RETURNING id INTO v_match_id;

        FOR j IN i..v_chunk_end LOOP
            INSERT INTO public.tournament_match_participants (match_id, registration_id)
            VALUES (v_match_id, v_reg_ids[j]);
        END LOOP;

        i := v_chunk_end + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_matches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;
    END IF;
END $$;


-- 18. TOURNAMENT OPS PHASE C: match scheduling + check-in.
-- Admins are fully trusted elsewhere in this schema (tournaments, deposits,
-- membership requests all use a plain is_admin()-gated UPDATE policy with no
-- column restriction), so scheduling is just a direct admin UPDATE -- no RPC.
DROP POLICY IF EXISTS "Admins can update tournament matches" ON public.tournament_matches;
CREATE POLICY "Admins can update tournament matches" ON public.tournament_matches
    FOR UPDATE USING (public.is_admin());

-- Check-in, by contrast, is player-facing and needs to touch exactly one
-- narrow field (checked_in_at) without exposing result_placement/result_points
-- (PUBG scoring, entered by admins in a later phase) to a raw column-level
-- UPDATE policy -- so it's a SECURITY DEFINER RPC, same reasoning as every
-- other cross-user write in this file. Only the team captain (or the solo
-- registrant, who is captain of their own 1-person team) can check in, and
-- only inside the 30-minute window before scheduled_time.
CREATE OR REPLACE FUNCTION public.check_in_for_match(p_match_id UUID)
RETURNS void AS $$
DECLARE
    v_caller UUID := auth.uid();
    v_match public.tournament_matches;
    v_registration_id UUID;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_match FROM public.tournament_matches WHERE id = p_match_id;
    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match not found';
    END IF;

    IF v_match.scheduled_time IS NULL THEN
        RAISE EXCEPTION 'This match has not been scheduled yet';
    END IF;

    IF v_match.scheduled_time - INTERVAL '30 minutes' > NOW() THEN
        RAISE EXCEPTION 'Check-in opens 30 minutes before the scheduled match time';
    END IF;

    IF v_match.status = 'completed' THEN
        RAISE EXCEPTION 'This match is already completed';
    END IF;

    SELECT ttm.registration_id INTO v_registration_id
    FROM public.tournament_match_participants tmp
    JOIN public.tournament_team_members ttm ON ttm.registration_id = tmp.registration_id
    WHERE tmp.match_id = p_match_id
      AND ttm.user_id = v_caller
      AND ttm.is_captain = true;

    IF v_registration_id IS NULL THEN
        RAISE EXCEPTION 'Only the team captain can check in, and only for their own match';
    END IF;

    UPDATE public.tournament_match_participants
    SET checked_in_at = NOW()
    WHERE match_id = p_match_id AND registration_id = v_registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_match_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_match_participants;
    END IF;
END $$;


-- 19. TOURNAMENT OPS PHASE D: match chat.
-- Scoped to team captains only (per spec: "chat between those two leader" for
-- MLBB, "group chat between only leader" for PUBG) -- not the whole roster.
-- A solo/PUBG registrant is captain of their own 1-person team (Phase A), so
-- the same policy covers both game types uniformly. Plain text log, no
-- attachments/typing indicators (confirmed scope).
CREATE TABLE IF NOT EXISTS public.tournament_match_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.tournament_matches ON DELETE CASCADE NOT NULL,
    sender_user_id UUID REFERENCES public.profiles NOT NULL,
    body TEXT NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tournament_match_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Match captains can view chat" ON public.tournament_match_messages;
CREATE POLICY "Match captains can view chat" ON public.tournament_match_messages
    FOR SELECT USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.tournament_match_participants tmp
            JOIN public.tournament_team_members ttm ON ttm.registration_id = tmp.registration_id
            WHERE tmp.match_id = tournament_match_messages.match_id
              AND ttm.user_id = auth.uid()
              AND ttm.is_captain = true
        )
    );

DROP POLICY IF EXISTS "Match captains can send chat" ON public.tournament_match_messages;
CREATE POLICY "Match captains can send chat" ON public.tournament_match_messages
    FOR INSERT WITH CHECK (
        sender_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.tournament_match_participants tmp
            JOIN public.tournament_team_members ttm ON ttm.registration_id = tmp.registration_id
            WHERE tmp.match_id = tournament_match_messages.match_id
              AND ttm.user_id = auth.uid()
              AND ttm.is_captain = true
        )
    );

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_match_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_match_messages;
    END IF;
END $$;


-- 20. TOURNAMENT OPS PHASE E: result submission + admin verification.
-- A captain submits what they saw; an admin has the final say (can confirm
-- the proposed winner as-is, or pick the other team if the submission was
-- wrong/disputed) within their own ~10-minute review target. Lobby (PUBG)
-- matches have no single winner -- admins enter placement/points per player
-- directly instead, so they only need submit_match_result to flag "played".
ALTER TABLE public.tournament_matches ADD COLUMN IF NOT EXISTS proposed_winner_registration_id UUID REFERENCES public.tournament_registrations;
ALTER TABLE public.tournament_matches ADD COLUMN IF NOT EXISTS result_proof_url TEXT;
ALTER TABLE public.tournament_matches ADD COLUMN IF NOT EXISTS result_submitted_by UUID REFERENCES public.profiles;
ALTER TABLE public.tournament_matches ADD COLUMN IF NOT EXISTS result_submitted_at TIMESTAMP WITH TIME ZONE;

-- Admins are already broadly trusted on tournament_matches (Phase C); extend
-- the same direct-UPDATE trust to participants so admins can enter PUBG
-- lobby placement/points per player without a dedicated RPC.
DROP POLICY IF EXISTS "Admins can update match participants" ON public.tournament_match_participants;
CREATE POLICY "Admins can update match participants" ON public.tournament_match_participants
    FOR UPDATE USING (public.is_admin());

-- Storage bucket for optional result screenshots -- public read (match
-- evidence for an already-public bracket), upload restricted to the
-- uploader's own folder, same pattern as deposit_proof/tournament_banners.
INSERT INTO storage.buckets (id, name, public)
VALUES ('match_result_proofs', 'match_result_proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Match result proofs are viewable by everyone" ON storage.objects;
CREATE POLICY "Match result proofs are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'match_result_proofs');

DROP POLICY IF EXISTS "Users can upload their own match result proof" ON storage.objects;
CREATE POLICY "Users can upload their own match result proof"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'match_result_proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Caller must be a captain of one of this match's teams. Bracket matches
-- require a proposed winner (validated as an actual participant); lobby
-- matches ignore it (no single winner) -- either just flips status to
-- 'awaiting_review' so it shows up in the admin queue.
CREATE OR REPLACE FUNCTION public.submit_match_result(
    p_match_id UUID,
    p_proposed_winner_registration_id UUID DEFAULT NULL,
    p_result_proof_url TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_caller UUID := auth.uid();
    v_match public.tournament_matches;
    v_registration_id UUID;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_match FROM public.tournament_matches WHERE id = p_match_id;
    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match not found';
    END IF;

    IF v_match.status = 'completed' THEN
        RAISE EXCEPTION 'This match is already completed';
    END IF;

    SELECT ttm.registration_id INTO v_registration_id
    FROM public.tournament_match_participants tmp
    JOIN public.tournament_team_members ttm ON ttm.registration_id = tmp.registration_id
    WHERE tmp.match_id = p_match_id
      AND ttm.user_id = v_caller
      AND ttm.is_captain = true;

    IF v_registration_id IS NULL THEN
        RAISE EXCEPTION 'Only a team captain in this match can submit a result';
    END IF;

    IF v_match.match_type = 'bracket' THEN
        IF p_proposed_winner_registration_id IS NULL THEN
            RAISE EXCEPTION 'Select the winning team';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM public.tournament_match_participants
            WHERE match_id = p_match_id AND registration_id = p_proposed_winner_registration_id
        ) THEN
            RAISE EXCEPTION 'That team is not a participant in this match';
        END IF;
    END IF;

    UPDATE public.tournament_matches
    SET status = 'awaiting_review',
        proposed_winner_registration_id = p_proposed_winner_registration_id,
        result_proof_url = p_result_proof_url,
        result_submitted_by = v_caller,
        result_submitted_at = NOW()
    WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Internal helper: once every match in a bracket round is 'completed', pairs
-- up that round's winners into the next round (same shuffle-free pairing +
-- single-bye + best-of-3-final logic as generate_bracket's initial pairing,
-- just operating on winners instead of fresh registrations). A no-op if the
-- round isn't fully decided yet, if it was the final (only 1 match), or if
-- the next round was already generated (idempotency guard against being
-- called twice for the same round).
CREATE OR REPLACE FUNCTION public.advance_bracket_round(p_tournament_id UUID, p_round INTEGER)
RETURNS void AS $$
DECLARE
    v_incomplete_count INTEGER;
    v_winner_ids UUID[];
    v_count INTEGER;
    v_total_matches INTEGER;
    v_match_id UUID;
    v_match_index INTEGER := 0;
    i INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_incomplete_count
    FROM public.tournament_matches
    WHERE tournament_id = p_tournament_id AND round = p_round AND status != 'completed';

    IF v_incomplete_count > 0 THEN
        RETURN;
    END IF;

    SELECT array_agg(winner_registration_id ORDER BY created_at) INTO v_winner_ids
    FROM public.tournament_matches
    WHERE tournament_id = p_tournament_id AND round = p_round;

    v_count := COALESCE(array_length(v_winner_ids, 1), 0);

    IF v_count <= 1 THEN
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM public.tournament_matches WHERE tournament_id = p_tournament_id AND round = p_round + 1) THEN
        RETURN;
    END IF;

    v_total_matches := CEIL(v_count::numeric / 2)::INTEGER;

    i := 1;
    WHILE i <= v_count LOOP
        v_match_index := v_match_index + 1;

        IF i + 1 <= v_count THEN
            INSERT INTO public.tournament_matches (tournament_id, round, label, match_type, best_of)
            VALUES (
                p_tournament_id,
                p_round + 1,
                CASE WHEN v_total_matches = 1 THEN 'Final' ELSE 'Round ' || (p_round + 1) || ' - Match ' || v_match_index END,
                'bracket',
                CASE WHEN v_total_matches = 1 THEN 3 ELSE 1 END
            )
            RETURNING id INTO v_match_id;

            INSERT INTO public.tournament_match_participants (match_id, registration_id)
            VALUES (v_match_id, v_winner_ids[i]), (v_match_id, v_winner_ids[i + 1]);
        ELSE
            INSERT INTO public.tournament_matches (tournament_id, round, label, match_type, best_of, status, winner_registration_id)
            VALUES (p_tournament_id, p_round + 1, 'Round ' || (p_round + 1) || ' - Bye', 'bracket', 1, 'completed', v_winner_ids[i])
            RETURNING id INTO v_match_id;

            INSERT INTO public.tournament_match_participants (match_id, registration_id)
            VALUES (v_match_id, v_winner_ids[i]);
        END IF;

        i := i + 2;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin-only. Confirms the actual winner (defaults to whatever the admin
-- passes -- the frontend pre-fills the captain's proposed winner, but the
-- admin can override it before confirming if the submission was disputed
-- or wrong). Marks the match completed and attempts to advance the round.
CREATE OR REPLACE FUNCTION public.confirm_match_result(p_match_id UUID, p_winner_registration_id UUID)
RETURNS void AS $$
DECLARE
    v_match public.tournament_matches;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can confirm match results';
    END IF;

    SELECT * INTO v_match FROM public.tournament_matches WHERE id = p_match_id;
    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match not found';
    END IF;

    IF v_match.match_type != 'bracket' THEN
        RAISE EXCEPTION 'Only bracket matches have a single winner to confirm';
    END IF;

    IF v_match.status = 'completed' THEN
        RAISE EXCEPTION 'This match is already completed';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.tournament_match_participants
        WHERE match_id = p_match_id AND registration_id = p_winner_registration_id
    ) THEN
        RAISE EXCEPTION 'That team is not a participant in this match';
    END IF;

    UPDATE public.tournament_matches
    SET status = 'completed', winner_registration_id = p_winner_registration_id
    WHERE id = p_match_id;

    PERFORM public.advance_bracket_round(v_match.tournament_id, v_match.round);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 21. GAME ID AI VERIFICATION: automates the manual "admin looks it up" step
-- from section 8 for the common case, using a vision AI call instead of an
-- admin's own eyes. Player uploads a screenshot of their in-game profile
-- screen alongside their ID; a Supabase Edge Function (not plain SQL --
-- outbound HTTP calls to a third-party AI API can't run inside Postgres)
-- reads the ID + nickname off the image and either auto-verifies on a match
-- or leaves it 'pending' for the existing admin queue to review by eye.
-- This is the first Edge Function in the project -- everything else so far
-- is client + SECURITY DEFINER RPC. The function uses the Supabase
-- service-role key (bypasses RLS by design), so no new RPC is needed for it
-- to write the verification result -- see supabase/functions/verify-game-id/.
ALTER TABLE public.game_id_links ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE public.game_id_links ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('manual', 'ai_vision'));
ALTER TABLE public.game_id_links ADD COLUMN IF NOT EXISTS ai_extracted_id TEXT;
ALTER TABLE public.game_id_links ADD COLUMN IF NOT EXISTS ai_extracted_nickname TEXT;

-- Storage bucket for profile screenshots -- same owner-folder-upload +
-- owner-or-admin-view pattern as deposit_proof/membership_proof. Not a public
-- bucket: these are screenshots of someone's game account, no reason for
-- other players to see them.
INSERT INTO storage.buckets (id, name, public)
VALUES ('game_id_screenshots', 'game_id_screenshots', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own game id screenshot" ON storage.objects;
CREATE POLICY "Users can upload their own game id screenshot"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'game_id_screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own game id screenshot" ON storage.objects;
CREATE POLICY "Users can view their own game id screenshot"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'game_id_screenshots'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

-- Rewritten: now stores the screenshot path alongside the ID. Explicit DROP
-- first -- the old 2-arg signature is a different overload as far as
-- Postgres is concerned (same gotcha as register_for_tournament earlier).
DROP FUNCTION IF EXISTS public.link_game_id(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.link_game_id(
    p_game_type TEXT,
    p_in_game_id TEXT,
    p_screenshot_url TEXT DEFAULT NULL
)
RETURNS public.game_id_links AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_result public.game_id_links;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF trim(p_in_game_id) = '' THEN
        RAISE EXCEPTION 'Enter your in-game user ID';
    END IF;

    INSERT INTO public.game_id_links (user_id, game_type, in_game_id, screenshot_url)
    VALUES (v_user_id, p_game_type, trim(p_in_game_id), p_screenshot_url)
    ON CONFLICT (user_id, game_type)
    DO UPDATE SET
        in_game_id = trim(p_in_game_id),
        screenshot_url = p_screenshot_url,
        status = 'pending',
        verification_method = NULL,
        ai_extracted_id = NULL,
        ai_extracted_nickname = NULL,
        admin_notes = NULL,
        submitted_at = TIMEZONE('utc'::text, NOW())
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
