-- Supabase Database Schema for PowerLit
-- Run these SQL commands in the Supabase SQL Editor (https://supabase.com/dashboard)

-- Create the analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security

-- Users can only view their own analyses
CREATE POLICY "Users can view own analyses"
    ON public.analyses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own analyses
CREATE POLICY "Users can insert own analyses"
    ON public.analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own analyses
CREATE POLICY "Users can update own analyses"
    ON public.analyses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own analyses
CREATE POLICY "Users can delete own analyses"
    ON public.analyses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;

-- Enable realtime for the analyses table (optional - if you want live updates)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
