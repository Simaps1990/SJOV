import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface NotificationsContextType {
  nonTraitees: number;
  annoncesEnAttente: number;
  updateNonTraitees: (count?: number) => void;
  updateAnnoncesEnAttente: (count?: number) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nonTraitees, setNonTraitees] = useState(0);
  const [annoncesEnAttente, setAnnoncesEnAttente] = useState(0);

  // Fonction pour mettre à jour le nombre de demandes non traitées
  const updateNonTraitees = async (count?: number) => {
    if (count !== undefined) {
      setNonTraitees(count);
    } else {
      // Si aucun nombre n'est fourni, récupérer depuis le localStorage
      const data = JSON.parse(localStorage.getItem('applications') || '[]');
      const nonTraiteesCount = data.filter((d: any) => !d.processed && !d.archived).length;
      setNonTraitees(nonTraiteesCount);
    }
  };

  // Fonction pour mettre à jour le nombre d'annonces en attente
  const updateAnnoncesEnAttente = async (count?: number) => {
    if (count !== undefined) {
      setAnnoncesEnAttente(count);
    } else {
      // Si aucun nombre n'est fourni, récupérer depuis Supabase
      await fetchAnnoncesEnAttente();
    }
  };

  // Fonction pour récupérer le nombre d'annonces en attente depuis Supabase
  const fetchAnnoncesEnAttente = async () => {
    try {
      const { count, error } = await supabase
        .from('annonces')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'en_attente');

      if (error) {
        console.error('Erreur lors de la récupération des annonces en attente:', error);
        return;
      }

      setAnnoncesEnAttente(count || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces en attente:', error);
    }
  };

  // Fonction pour récupérer le nombre de demandes non traitées depuis Supabase
  const fetchNonTraitees = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('processed', false)
        .or('archived.is.null,archived.eq.false');

      if (error) {
        console.error('Erreur lors de la récupération des demandes non traitées:', error);
        return;
      }

      // Mettre à jour le localStorage et l'état
      localStorage.setItem('applications', JSON.stringify(data || []));
      setNonTraitees(data?.length || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes non traitées:', error);
    }
  };

  // Fonction pour rafraîchir toutes les notifications
  const refreshNotifications = async () => {
    await Promise.all([fetchNonTraitees(), fetchAnnoncesEnAttente()]);
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    refreshNotifications();

    // Configurer un rafraîchissement périodique (toutes les 5 minutes)
    const intervalId = setInterval(refreshNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const value = {
    nonTraitees,
    annoncesEnAttente,
    updateNonTraitees,
    updateAnnoncesEnAttente,
    refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
