import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { Event } from '../types';
import { formatDate } from '../utils/formatters';
import { Calendar, MapPin, ChevronLeft, Clock } from 'lucide-react';
import SEO from '../components/SEO';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events } = useContent();
  const [event, setEvent] = useState<Event | null>(null);
const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      const foundEvent = events.find(e => e.id === id);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        navigate('/events');
      }
    }
  }, [id, events, navigate]);

if (!event) return (
  <div className="pb-16">
    <div className="container-custom">
      <p>Chargement de l'événement...</p>
    </div>
  </div>
);

const annexesSansCover = event.imagesannexes?.filter(img => img && img !== event.image);


  // Extraction des 150 premiers caractères de la description pour la meta description
  const getMetaDescription = () => {
    if (!event.description) return '';
    // Limiter à 150 caractères
    return event.description.substring(0, 150) + (event.description.length > 150 ? '...' : '');
  };

  // Génération de mots-clés à partir du titre de l'événement
  const getMetaKeywords = () => {
    const baseKeywords = "événements jardinage, SJOV, Société des Jardins Ouvriers de Villeurbanne, jardins partagés, Villeurbanne, 69100, Rhône-Alpes, Lyon, Métropole de Lyon, Auvergne-Rhône-Alpes, bénévolat";
    
    // Ajout de mots-clés spécifiques basés sur le titre de l'événement
    const titleKeywords = event.title
      .toLowerCase()
      .replace(/[^a-zàâçéèêëîïôûùüÿñæœ0-9\s]/gi, '')
      .split(' ')
      .filter(word => word.length > 3) // Filtrer les mots courts
      .join(', ');
    
    // Ajout de mots-clés spécifiques basés sur la date de l'événement
    const date = new Date(event.date);
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    const year = date.getFullYear();
    
    return `${baseKeywords}, ${titleKeywords}, ${month}, ${year}, atelier jardinage, animation jardin, événement associatif`;
  };

  return (
    <div className="pb-16">
      <SEO
        title={`${event.title} | Événements SJOV | Jardinage à Villeurbanne | Rhône-Alpes`}
        description={getMetaDescription()}
        keywords={getMetaKeywords()}
      />
      <div className="container-custom">
        <Link 
          to="/events" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ChevronLeft size={16} className="mr-1" /> Retour aux événements
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-72 md:h-96 overflow-hidden">
            <img 
              src={event.image ?? undefined} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:p-8">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4 ${
              event.isPast ? 'bg-neutral-500' : 'bg-accent-500'
            }`}>
              {event.isPast ? 'Événement passé' : 'À venir'}
            </div>
            
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">{event.title}</h1>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-neutral-600 mb-6">
              <div className="flex items-center">
                <Calendar size={20} className="mr-2 text-primary-500" />
                <span>{formatDate(event.date)}</span>
              </div>

              {event.enddate && (
  <div className="flex items-center">
    <Clock size={20} className="mr-2 text-primary-500" />
    <span>Fin : {formatDate(event.enddate)}</span>
  </div>
)}
              <div className="flex items-center">
                <MapPin size={20} className="mr-2 text-primary-500" />
                <span>{event.location}</span>
              </div>
            </div>
            
<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: event.content }} />

{annexesSansCover && annexesSansCover.length > 0 && (
  <div
    className={`mt-6 grid gap-4 ${
      annexesSansCover.length === 1
        ? 'grid-cols-1'
        : annexesSansCover.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-3'
    }`}
  >
    {annexesSansCover.map((img, i) =>
      img ? (
        <div key={i} className="w-full flex justify-center">
          <img
src={img ?? undefined}
            alt={`Image annexe ${i + 1}`}
onClick={() => setFullscreenIndex(i)}

            className="cursor-pointer max-h-[500px] w-auto object-contain rounded hover:opacity-80 transition"
          />
        </div>
      ) : null
    )}
  </div>
)}


            {!event.isPast && (
              <div className="mt-8 p-6 bg-primary-50 rounded-lg border border-primary-100">
                <h3 className="font-heading font-semibold text-xl mb-2">Informations pratiques</h3>
                <p className="mb-4">
                  Pour participer à cet événement, merci de vous inscrire à l'avance par email ou par téléphone.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
{fullscreenIndex !== null && annexesSansCover && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    onClick={() => setFullscreenIndex(null)}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <img
        src={annexesSansCover[fullscreenIndex]!}
        className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
      />
      {annexesSansCover.length > 1 && (
        <>
          <button
            onClick={() =>
              setFullscreenIndex((fullscreenIndex - 1 + annexesSansCover.length) % annexesSansCover.length)
            }
            className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white text-2xl bg-black/50 px-2 rounded"
          >
            ←
          </button>
          <button
            onClick={() =>
              setFullscreenIndex((fullscreenIndex + 1) % annexesSansCover.length)
            }
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white text-2xl bg-black/50 px-2 rounded"
          >
            →
          </button>
        </>
      )}
      <button
        onClick={() => setFullscreenIndex(null)}
        className="absolute top-2 right-2 text-white text-xl bg-black/60 px-2 rounded"
      >
        ✕
      </button>
    </div>
  </div>
)}

    </div>


  );
};

export default EventDetailPage;
