DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditRunStatus') THEN
    ALTER TYPE "AuditRunStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';
  END IF;
END $$;
