-- Add show_if column to poll_questions
ALTER TABLE poll_questions ADD COLUMN IF NOT EXISTS show_if TEXT;

-- Insert agent license number and CAC questions with conditional logic
WITH selected_form AS (
  SELECT id FROM poll_forms WHERE slug = 'realest-launch-intelligence-2026' LIMIT 1
)
INSERT INTO poll_questions (
  form_id, question_key, segment, prompt, question_type, options, is_required, display_order, show_if
)
SELECT selected_form.id, q.question_key, q.segment, q.prompt, q.question_type, q.options::jsonb, q.is_required, q.display_order, q.show_if
FROM selected_form
CROSS JOIN (
  VALUES
    -- Agent License Number (only if licensed agent is yes)
    ('q21b_agent_license_number','agent','What is your agent license number?','text',NULL,true,211,'q21_agent_licensed=="yes"'),
    -- CAC Certificate (only if licensed agent is yes)
    ('q21c_agent_has_cac','agent','Do you have a registered company with CAC certificates?','single_choice','[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]',true,212,'q21_agent_licensed=="yes"'),
    -- License Certificate Name (only if CAC is no)
    ('q21d_agent_license_cert_name','agent','Enter your license certificate name','text',NULL,true,213,'q21_agent_licensed=="yes"&&q21c_agent_has_cac=="no"')
) AS q(question_key, segment, prompt, question_type, options, is_required, display_order, show_if)
ON CONFLICT (form_id, question_key) DO UPDATE
SET segment = EXCLUDED.segment,
    prompt = EXCLUDED.prompt,
    question_type = EXCLUDED.question_type,
    options = EXCLUDED.options,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    show_if = EXCLUDED.show_if,
    updated_at = now();
