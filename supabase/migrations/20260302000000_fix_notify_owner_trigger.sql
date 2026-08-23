-- Fix: notify_owner_of_status_change() used NEW.owner_id directly as notifications.user_id
-- but properties.owner_id references owners.id, NOT profiles.id.
-- The correct path is: owners.profile_id → profiles.id.
-- This patch resolves the correct profile_id before inserting the notification.

CREATE OR REPLACE FUNCTION public.notify_owner_of_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id  uuid;
  doc_reason    text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Resolve the owner's profile_id (owner_id → owners.profile_id → profiles.id)
    SELECT o.profile_id
    INTO   v_profile_id
    FROM   public.owners o
    WHERE  o.id = NEW.owner_id
    LIMIT  1;

    -- If no owner profile found, skip the notification silently
    IF v_profile_id IS NULL THEN
      RETURN NEW;
    END IF;

    doc_reason := NULL;

    IF NEW.status = 'rejected' THEN
      SELECT pd.notes
      INTO   doc_reason
      FROM   public.property_documents pd
      WHERE  pd.property_id = NEW.id
        AND  pd.verification_status = 'rejected'
      ORDER  BY pd.updated_at DESC NULLS LAST
      LIMIT  1;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_profile_id,
      'property_status_changed',
      CASE
        WHEN NEW.status = 'live'              THEN 'Property Approved!'
        WHEN NEW.status = 'rejected'          THEN 'Property Rejected'
        WHEN NEW.status = 'pending_vetting'   THEN 'Property Under Review'
        ELSE 'Property Status Updated'
      END,
      CASE
        WHEN NEW.status = 'live'            THEN 'Your property has been approved and is now live on the platform.'
        WHEN NEW.status = 'rejected'        THEN 'Your property listing has been rejected. Reason: ' || COALESCE(doc_reason, 'Contact support for details.')
        WHEN NEW.status = 'pending_vetting' THEN 'Your property documents have been validated and are now under physical vetting.'
        ELSE 'Your property status has been updated.'
      END,
      jsonb_build_object(
        'property_id', NEW.id,
        'old_status',  OLD.status,
        'new_status',  NEW.status
      ) || CASE
        WHEN doc_reason IS NOT NULL THEN jsonb_build_object('rejection_reason', doc_reason)
        ELSE '{}'::jsonb
      END
    );
  END IF;

  RETURN NEW;
END;
$$;
