-- Migration pour ajouter les colonnes archived et archived_date à la table applications
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne archived (booléen, par défaut false)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Ajouter la colonne archived_date (timestamp avec timezone, nullable)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS archived_date TIMESTAMPTZ;

-- Créer un index pour améliorer les performances des requêtes sur archived
CREATE INDEX IF NOT EXISTS idx_applications_archived ON applications(archived);

-- Créer un index pour améliorer les performances des requêtes sur processed et archived
CREATE INDEX IF NOT EXISTS idx_applications_processed_archived ON applications(processed, archived);

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN applications.archived IS 'Indique si la demande a été archivée';
COMMENT ON COLUMN applications.archived_date IS 'Date et heure de l''archivage de la demande';
