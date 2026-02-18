-- Add personal information fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN first_name text,
ADD COLUMN last_name text,
ADD COLUMN phone_number text,
ADD COLUMN street_address text,
ADD COLUMN apt_number text,
ADD COLUMN city text,
ADD COLUMN state text,
ADD COLUMN zipcode text,
ADD COLUMN country text DEFAULT 'USA';

-- Add check constraint for USA only
ALTER TABLE public.profiles
ADD CONSTRAINT country_usa_only CHECK (country = 'USA');

-- Add check constraint for valid US states
ALTER TABLE public.profiles
ADD CONSTRAINT valid_us_state CHECK (
  state IN (
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ) OR state IS NULL
);