import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'SJOV - Association des Jardins Familiaux, Jardins Partagés & Jardin Solidaire Villeurbanne',
  description = 'Association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif à Villeurbanne (69100). Demande jardins familiaux, jardin communal, jardins collectifs, jardin communautaire, jardins participatifs et jardin en partage. Membre FNJFC. Jardinons à l\'école, jardiner à Paris et région Rhône-Alpes. Les jardins familiaux depuis 1936.',
  keywords = 'jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, demande jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardinons a l\'ecole, jardiner a paris, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, gmap, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, SJOV, Société des Jardins Ouvriers de Villeurbanne, jardins partagés, jardinage urbain, Villeurbanne, 69100, Rhône-Alpes, Lyon, Métropole de Lyon, Auvergne-Rhône-Alpes, bénévolat, permaculture, biodiversité, écologie, jardinage, potager urbain, agriculture urbaine, jardin, plantation, culture, potager, maraîchage, légumes, compost, semis, récolte, fruits, légumes bio, horticulture, plantes aromatiques, fleurs, verger, agroécologie, développement durable, partage de savoirs, lien social, vie associative, animations jardinage, ateliers pédagogiques, graines, terreau, outils de jardin, parcelle de jardin, parcelle familiale, lopin de terre, jardinage participatif',
  image = 'https://sjov.fr/images/sjov-logo.png',
  url = `https://sjov.fr${window.location.pathname}`,
  type = 'website',
}) => {
  const siteTitle = 'SJOV - Association des Jardins Familiaux de Villeurbanne';
  
  return (
    <Helmet>
      {/* Balises meta de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Balises Open Graph pour les réseaux sociaux */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://sjov.fr${image}`} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Balises Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://sjov.fr${image}`} />
      
      {/* Balises supplémentaires pour le référencement local */}
      <meta name="geo.region" content="FR-69" />
      <meta name="geo.placename" content="Villeurbanne, Rhône-Alpes" />
      <meta name="geo.position" content="45.7675;4.8800" />
      <meta name="ICBM" content="45.7675, 4.8800" />
      <meta name="geo.region" content="FR-ARA" /> {/* Code région Auvergne-Rhône-Alpes */}
      
      {/* Balise de langue */}
      <meta property="og:locale" content="fr_FR" />
      <link rel="canonical" href={url.includes('sjov.fr') ? url : `https://sjov.fr${window.location.pathname}`} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};

export default SEO;
