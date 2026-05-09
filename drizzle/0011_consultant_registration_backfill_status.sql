UPDATE consultant_registrations
SET status = 'approved'
WHERE status = 'contacted';

UPDATE consultant_registrations
SET status = 'rejected'
WHERE status = 'closed';
