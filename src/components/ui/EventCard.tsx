import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Event } from '../../types';
import { formatDate } from '../../utils/formatters';

interface EventCardProps {
  event: Event;
  isFeature?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isFeature = false }) => {
  return (
<Link
  to={`/events/${event.id}`}
  className={`card group transition-all duration-300 block hover:-translate-y-1 hover:shadow-lg ${event.isPast ? 'opacity-80' : ''}`}
>
      <div className="relative overflow-hidden h-48 rounded-t-lg">
        <img
          src={event.image ?? '/placeholder.jpg'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          className={`absolute top-0 right-0 ${
            event.isPast ? 'bg-neutral-500' : 'bg-accent-500'
          } text-white px-3 py-1 text-sm font-medium`}
        >
          {event.isPast ? 'Passé' : 'À venir'}
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col space-y-1 text-sm text-neutral-500 mb-3">
          <div className="flex items-center">
            <Calendar size={16} className="mr-2 text-primary-500" />
            <span>{formatDate(event.date)}</span>
          </div>

          {event.enddate && (
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-primary-500" />
              <span>Fin : {formatDate(event.enddate)}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-primary-500" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <h3 className="font-heading font-semibold text-xl mb-2">
<span className="text-neutral-800 group-hover:text-primary-600 transition-colors duration-200">
  {event.title}
</span>

        </h3>

<p className="text-neutral-600 mb-2">
            {isFeature
            ? event.description ?? ''
            : `${event.description?.substring(0, 100) ?? ''}${
                event.description && event.description.length > 100 ? '...' : ''
              }`}
        </p>


      </div>
    </Link>
  );
};

export default EventCard;
