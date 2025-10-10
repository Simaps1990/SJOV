import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { BlogPost } from '../../types';
import { formatDate } from '../../utils/formatters';

interface BlogCardProps {
  post: BlogPost;
  isFeature?: boolean;
}

// Fonction pour extraire le texte brut du HTML et créer un extrait
const getTextExcerpt = (html: string, maxLength: number = 150): string => {
  // Créer un élément temporaire pour parser le HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Extraire le texte brut
  const text = temp.textContent || temp.innerText || '';
  
  // Nettoyer les espaces multiples et retours à la ligne
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Tronquer et ajouter des points de suspension
  if (cleanText.length > maxLength) {
    return cleanText.substring(0, maxLength).trim() + '...';
  }
  
  return cleanText;
};

const BlogCard: React.FC<BlogCardProps> = ({ post, isFeature = false }) => {
  return (
    <article
      className={`card group transition-all duration-300 h-full ${
        isFeature ? 'md:flex' : ''
      }`}
    >
      {/* Image principale */}
<div
  className={`relative overflow-hidden ${
    isFeature ? 'md:w-2/5 h-64' : 'h-64'
  }`}
>
  <img
    src={post.image}
    alt={post.title}
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  />
</div>


      {/* Contenu texte + bouton */}
      <div
        className={`p-6 flex flex-col justify-between ${
          isFeature ? 'md:w-3/5' : ''
        }`}
      >
        <div>
  <div className="flex flex-col space-y-1 text-sm text-neutral-500 mb-3">
  <div className="flex items-center">
    <Calendar size={16} className="mr-2 text-primary-500" />
    <span>{formatDate(post.date)}</span>
  </div>
  <div className="flex items-center">
    <User size={16} className="mr-2 text-primary-500" />
    <span>{post.author}</span>
  </div>
</div>


<h3 className="font-heading font-semibold text-xl mb-2">
              <Link
              to={`/blog/${post.id}`}
              className="text-neutral-800 hover:text-primary-600"
            >
              {post.title}
            </Link>
          </h3>
          
          {/* Extrait du contenu */}
          <p className="text-neutral-600 text-sm leading-relaxed">
            {getTextExcerpt(post.content)}
          </p>
        </div>

        <div className="mt-auto flex justify-end">
          <Link
            to={`/blog/${post.id}`}
            className="btn-outline inline-flex items-center text-sm"
          >
            Lire l'article
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
