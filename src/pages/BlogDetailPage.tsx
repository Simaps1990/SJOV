import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ChevronLeft } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { BlogPost } from '../types';
import { formatDate, sanitizeHtml } from '../utils/formatters';
import SEO from '../components/SEO';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blogPosts } = useContent();
  const [post, setPost] = useState<BlogPost | null>(null);
const [fullscreenImage, setFullscreenImage] = useState<{ current: string; next?: string } | null>(null);

  useEffect(() => {
    if (id) {
      const foundPost = blogPosts.find(p => p.id === id);
      if (foundPost) {
        setPost(foundPost);
      } else {
        navigate('/blog');
      }
    }
  }, [id, blogPosts, navigate]);

  if (!post) {
    return (
      <div className="pt-8 pb-16">
        <div className="container-custom">
          <p>Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  // Extraction des 150 premiers caractères du contenu pour la meta description
  const getMetaDescription = () => {
    if (!post.content) return '';
    // Suppression des balises HTML pour obtenir du texte brut
    const textContent = post.content.replace(/<[^>]*>/g, '');
    // Limiter à 150 caractères
    return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  };

  // Extraction de mots-clés à partir du titre et du contenu
  const getMetaKeywords = () => {
    const baseKeywords = "blog jardinage, SJOV, Société des Jardins Ouvriers de Villeurbanne, jardins partagés, Villeurbanne, 69100, Rhône-Alpes, Lyon, Métropole de Lyon, Auvergne-Rhône-Alpes, bénévolat";
    
    // Ajout de mots-clés spécifiques basés sur le titre de l'article
    const titleKeywords = post.title
      .toLowerCase()
      .replace(/[^a-zàâçéèêëîïôûùüÿñæœ0-9\s]/gi, '')
      .split(' ')
      .filter(word => word.length > 3) // Filtrer les mots courts
      .join(', ');
    
    return `${baseKeywords}, ${titleKeywords}, article jardinage, conseil potager`;
  };

  return (
    <div className="pt-8 pb-16">
      <SEO
        title={`${post.title} | Blog SJOV | Jardinage à Villeurbanne | Rhône-Alpes`}
        description={getMetaDescription()}
        keywords={getMetaKeywords()}
      />
      <div className="container-custom">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ChevronLeft size={16} className="mr-1" /> Retour au blog
        </Link>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-72 md:h-96 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">{post.title}</h1>
            
            <div className="flex items-center text-neutral-600 mb-6">
              <div className="flex items-center mr-6">
                <Calendar size={18} className="mr-2" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                <span>{post.author}</span>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
            </div>
{post.imagesannexes && post.imagesannexes.length > 0 && (
  <div
    className={`mt-6 grid gap-4 ${
      post.imagesannexes.length === 1 ? 'grid-cols-1' :
      post.imagesannexes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
    }`}
  >
{post.imagesannexes.map((img, i) =>
  img ? (
    <div key={i} className="w-full flex justify-center">
      <img
        src={img}
        alt={`Image annexe ${i + 1}`}
        onClick={() =>
          setFullscreenImage({
            current: img,
next: post.imagesannexes?.[(i + 1) % post.imagesannexes.length]
          })
        }
        className="cursor-pointer max-h-[500px] w-auto object-contain rounded hover:opacity-80 transition"
      />
    </div>
  ) : null
)}

  </div>
)}


          </div>
        </article>
      </div>
   


{fullscreenImage && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    onClick={() => setFullscreenImage(null)}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <img
        src={fullscreenImage.current}
        className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
      />
      {fullscreenImage.next && (
        <button
          onClick={() =>
            setFullscreenImage({
              current: fullscreenImage.next || "",
              next: fullscreenImage.current || ""
            })
          }
          className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white text-2xl bg-black/50 px-2 rounded"
        >
          ←
        </button>
      )}
      {fullscreenImage.next && (
        <button
          onClick={() =>
            setFullscreenImage({
              current: fullscreenImage.next || "",
              next: fullscreenImage.current || ""
            })
          }
          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white text-2xl bg-black/50 px-2 rounded"
        >
          →
        </button>
      )}
      <button
        onClick={() => setFullscreenImage(null)}
        className="absolute top-2 right-2 text-white text-xl bg-black/60 px-2 rounded"
      >
        ✕
      </button>
    </div>
  </div>
)}

</div>
)
;
};

export default BlogDetailPage;