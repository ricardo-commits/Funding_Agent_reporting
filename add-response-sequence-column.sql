-- Add response_sequence column to responses table
-- This column will track the sequence number of responses (1st, 2nd, 3rd, etc.)

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'responses' 
    AND column_name = 'response_sequence'
  ) THEN
    ALTER TABLE public.responses 
    ADD COLUMN response_sequence integer;
    
    -- Add an index for better query performance
    CREATE INDEX IF NOT EXISTS idx_responses_sequence 
    ON public.responses(response_sequence);
    
    RAISE NOTICE 'Added response_sequence column to responses table';
  ELSE
    RAISE NOTICE 'response_sequence column already exists in responses table';
  END IF;
END $$;
