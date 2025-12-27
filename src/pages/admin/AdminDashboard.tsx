import React, { useEffect, useState } from 'react';
import {
  FileText,
  Calendar,
  Users,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { supabase } from '../../supabaseClient';
import { Megaphone } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { blogPosts, events } = useContent();

  const upcomingEvents = events.filter(event => !event.isPast);

const [annoncesCount, setAnnoncesCount] = useState<number>(0);

const [nonTraitees, setNonTraitees] = useState(0);

const [parcellesOccupees, setParcellesOccupees] = useState<number | null>(null);
const [parcellesTotales, setParcellesTotales] = useState<number | null>(null);

  const recentPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

useEffect(() => {
  const fetchNonTraitees = async () => {
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);

    if (error) {
      console.error('Erreur chargement demandes :', error.message);
      return;
    }

    setNonTraitees(count || 0);
  };

  const fetchAnnoncesValidees = async () => {
    const { count, error } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'validé');

    if (!error) {
      setAnnoncesCount(count || 0);
    }
  };

  const fetchAnnoncesNonValidees = async () => {
    const { count, error } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'en_attente');

    if (!error) {
      localStorage.setItem('annoncesEnAttente', String(count || 0));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const fetchParcellesStats = async () => {
    const { count: totales, error: totalesError } = await supabase
      .from('parcelles')
      .select('*', { count: 'exact', head: true });

    if (totalesError) {
      console.error('Erreur chargement parcelles :', totalesError.message);
    } else {
      setParcellesTotales(totales ?? 0);
    }

    const { count: occupees, error: occupeesError } = await supabase
      .from('jardiniers')
      .select('*', { count: 'exact', head: true })
      .not('numero_parcelle', 'is', null);

    if (occupeesError) {
      console.error('Erreur chargement parcelles occupées :', occupeesError.message);
    } else {
      setParcellesOccupees(occupees ?? 0);
    }
  };

  fetchNonTraitees();
  fetchAnnoncesValidees();
  fetchAnnoncesNonValidees();
  fetchParcellesStats();

  const interval = setInterval(() => {
    fetchNonTraitees();
    fetchParcellesStats();
  }, 30000);

  return () => {
    clearInterval(interval);
    localStorage.removeItem('annoncesEnAttente');
  };
}, []);


  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dateFormatted} à ${hours}h${minutes}`;
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Tableau de bord</h1>

      {/* Stats Cards */}
<div className="flex flex-wrap gap-4 mb-8">



<button
  onClick={() => window.location.href = '/admin/blog'}
  className="w-[220px] bg-white rounded-lg shadow-sm px-6 py-5 hover:bg-neutral-50 transition-colors text-left"
>
  <div className="flex flex-col items-start justify-center gap-4">
    <div className="text-base font-medium">Articles</div>

    <div className="flex gap-2 items-center ml-1">
      <div className="bg-primary-100 rounded-full flex items-center justify-center w-9 h-9">
        <FileText className="text-primary-600 w-6 h-6" />
      </div>
      <div className="text-2xl font-bold leading-none">{blogPosts.length}</div>
    </div>
  </div>
</button>





<button
  onClick={() => window.location.href = '/admin/events'}
  className="w-[220px] bg-white rounded-lg shadow-sm px-6 py-5 hover:bg-neutral-50 transition-colors text-left"
>
  <div className="flex flex-col items-start justify-center gap-4">
    <div className="text-base font-medium">Événements à venir</div>
    <div className="flex gap-2 items-center ml-1">
      <div className="bg-accent-100 rounded-full flex items-center justify-center w-9 h-9">
        <Calendar className="text-accent-600 w-6 h-6" />
      </div>
      <div className="text-2xl font-bold leading-none">{upcomingEvents.length}</div>
    </div>
  </div>
</button>





<button
  onClick={() => window.location.href = '/admin/applications'}
  className="w-[220px] bg-white rounded-lg shadow-sm px-6 py-5 hover:bg-neutral-50 transition-colors text-left"
>
  <div className="flex flex-col items-start justify-center gap-4">
    <div className="text-base font-medium">Demandes de jardin</div>
    <div className="flex gap-2 items-center ml-1">
      <div className="bg-secondary-100 rounded-full flex items-center justify-center w-9 h-9">
        <FileText className="text-secondary-600 w-6 h-6" />
      </div>
      <div className="text-2xl font-bold leading-none">{nonTraitees}</div>
    </div>
  </div>
</button>





<button
  onClick={() => window.location.href = '/admin/annonces'}
  className="w-[220px] bg-white rounded-lg shadow-sm px-6 py-5 hover:bg-neutral-50 transition-colors text-left"
>
  <div className="flex flex-col items-start justify-center gap-4">
    <div className="text-base font-medium">Annonces</div>
    <div className="flex gap-2 items-center ml-1">
      <div className="bg-yellow-100 rounded-full flex items-center justify-center w-9 h-9">
        <Megaphone className="text-yellow-600 w-6 h-6" />
      </div>
      <div className="text-2xl font-bold leading-none">{annoncesCount}</div>
    </div>
  </div>
</button>




<div className="w-[220px] bg-white rounded-lg shadow-sm px-6 py-5 hover:bg-neutral-50 transition-colors text-left">
  <div className="flex flex-col items-start justify-center gap-4">
    <div className="text-base font-medium">Parcelles occupées</div>
    <div className="flex gap-2 items-center ml-1">
      <div className="bg-green-100 rounded-full flex items-center justify-center w-9 h-9">
        <Users className="text-green-600 w-6 h-6" />
      </div>
      <div className="text-2xl font-bold leading-none">
        {parcellesOccupees ?? '--'} / {parcellesTotales ?? '--'}
      </div>
    </div>
  </div>
</div>




      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 mb-10">
        {/* Recent Blog Posts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">Articles récents</h2>
  {blogPosts.length > 3 && (
    <button
      onClick={() => window.location.href = '/admin/blog'}
      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
    >
      Voir tous les articles
    </button>
  )}
</div>


          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map(post => (
                <div key={post.id} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-800 mb-1">{post.title}</h3>
                  <span className="text-neutral-500 text-sm">{formatDate(post.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">Aucun article n'a été créé.</p>
          )}


        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">Événements à venir</h2>
  {events.length > 3 && (
    <button
      onClick={() => window.location.href = '/admin/events'}
      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
    >
      Voir tous les événements
    </button>
  )}
</div>


          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">{event.title}</h3>
                    <span className="text-neutral-500 text-sm">{formatDateTime(event.date)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-neutral-500">Aucun événement à venir n'est prévu.</p>
          )}


        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
