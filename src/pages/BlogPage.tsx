import React from 'react';
import { useContent } from '../context/ContentContext';
import BlogCard from '../components/ui/BlogCard';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const BlogPage: React.FC = () => {
  const { blogPosts } = useContent();

  // Tri du plus récent au plus ancien
  const sortedPosts = [...blogPosts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
<div className="pb-16">
      <SEO 
        title="Blog Jardins Familiaux, Jardins Partagés & Jardin Solidaire SJOV | Jardinons à l'école"
        description="Blog de l'association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif SJOV. Jardinons à l'école, jardiner à Paris. Conseils jardins collectifs, jardin communal, jardin communautaire, jardins participatifs. Membre FNJFC depuis 1936."
        keywords="jardinons a l'ecole, jardiner a paris, jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, demande jardins familiaux, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, blog jardinage, conseils plantation, culture potager, SJOV, Société des Jardins Ouvriers de Villeurbanne, Villeurbanne, 69100, Rhône-Alpes, Lyon, bénévolat"
      />

      <div className="container-custom">
        <h1 className="font-heading font-bold text-4xl mb-2">Nos articles de blog</h1>
        <p className="text-neutral-600 text-lg mb-8">
          Retrouvez ici les dernières nouvelles de notre association.
        </p>

        {sortedPosts.length > 0 ? (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0">
{sortedPosts.map((post) => (
  <Link to={`/blog/${post.id}`} key={post.id} className="block">
    <BlogCard post={post} />
  </Link>
))}

          </div>
        ) : (
          <p className="text-neutral-500 text-center">Aucun article pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
