import React from 'react';
import { Calendar, Phone, Mail, User } from 'lucide-react';
import { Annonce } from '../../types';
import { formatDate } from '../../utils/formatters';

interface AnnonceCardProps {
  annonce: Annonce;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce }) => {
  return (
    <article className="card group transition-all duration-300 h-full hover:-translate-y-1 hover:shadow-lg">
      {/* Image principale (photo1) */}
      {annonce.photo1 && (
        <div className="relative overflow-hidden h-48 rounded-t-lg">
          <img
            src={annonce.photo1}
            alt={annonce.nom}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Contenu */}
      <div className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col space-y-1 text-sm text-neutral-500 mb-3">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-primary-500" />
<span>{annonce.created_at ? formatDate(annonce.created_at) : 'Date inconnue'}</span>
            </div>
            <div className="flex items-center">
              <User size={16} className="mr-2 text-primary-500" />
              <span>{annonce.nom}</span>
            </div>
{annonce.telephone && (
  <div className="flex items-center">
    <Phone size={16} className="mr-2 text-primary-500" />
    <span>{annonce.telephone}</span>
  </div>
)}

            {annonce.email && (
              <div className="flex items-center">
                <Mail size={16} className="mr-2 text-primary-500" />
                <span>{annonce.email}</span>
              </div>
            )}
          </div>

<h3 className="font-heading font-semibold text-xl mb-2 text-neutral-800">
  {annonce.type?.toUpperCase()}
</h3>

<p className="text-sm text-gray-700 whitespace-pre-line">
  {annonce.contenu}
</p>

        </div>

        {annonce.photo2 && (
          <div className="mt-4">
            <img
              src={annonce.photo2}
              alt="photo secondaire"
              className="w-full h-40 object-cover rounded"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default AnnonceCard;
