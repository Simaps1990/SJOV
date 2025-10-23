import React from 'react';
import { useContent } from '../context/ContentContext';
import EventCard from '../components/ui/EventCard';
import SEO from '../components/SEO';

const EventsPage: React.FC = () => {
  const { events } = useContent();

  // Tri du plus récent au plus ancien
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="pb-16">
      <SEO 
        title="Événements Jardins Familiaux, Jardins Partagés & Jardin Solidaire SJOV | Jardinons à l'école"
        description="Événements de l'association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif SJOV. Jardins collectifs, jardin communal, jardin communautaire, jardins participatifs. Jardinons à l'école. Membre FNJFC. Ateliers jardinage à Villeurbanne depuis 1936."
        keywords="jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardinons a l'ecole, jardiner a paris, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, demande jardins familiaux, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, événements jardinage, ateliers plantation, SJOV, Société des Jardins Ouvriers de Villeurbanne, Villeurbanne, 69100, Rhône-Alpes, Lyon, bénévolat, animations jardinage, fête des jardins, troc de plantes"
      />
      <div className="container-custom">
        <h1 className="font-heading font-bold text-4xl mb-2">Événements</h1>
        <p className="text-neutral-600 text-lg mb-8">
          Découvrez les événements organisés par notre association
        </p>

        {sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">
              Aucun événement n'est disponible pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
