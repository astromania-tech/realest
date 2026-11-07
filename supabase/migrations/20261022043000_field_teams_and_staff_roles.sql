-- Connect field teams + staff roles (supervisor / team_leader / team_member).
-- admin = super admin; reviewer = desk. Field work is case-specific teams.
-- check_in_officer_id stays synced to properties.vetting_officer_id for badge gates.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'team_leader';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'team_member';

CREATE TABLE IF NOT EXISTS public.property_field_teams (
  property_id uuid PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  team_leader_id uuid NOT NULL REFERENCES public.users(id),
  check_in_officer_id uuid NOT NULL REFERENCES public.users(id),
  visit_day date NOT NULL,
  assigned_by uuid NOT NULL REFERENCES public.users(id),
  brief text,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_field_teams_leader
  ON public.property_field_teams (team_leader_id);
CREATE INDEX IF NOT EXISTS idx_property_field_teams_check_in
  ON public.property_field_teams (check_in_officer_id);
CREATE INDEX IF NOT EXISTS idx_property_field_teams_visit_day
  ON public.property_field_teams (visit_day);

CREATE TABLE IF NOT EXISTS public.property_field_team_members (
  property_id uuid NOT NULL REFERENCES public.property_field_teams(property_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (property_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_property_field_team_members_user
  ON public.property_field_team_members (user_id);

ALTER TABLE public.property_field_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_field_team_members ENABLE ROW LEVEL SECURITY;
