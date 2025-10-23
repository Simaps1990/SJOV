import React from 'react';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const AssociationPage: React.FC = () => {
  const { associationContent } = useContent();

if (!associationContent || !associationContent.id) {
  return (
    <div className="pt-24 pb-16 container-custom text-center text-gray-500">
      Chargement des informations de l’association...
    </div>
  );
}

const {
  titreAssociation,
  contentAssociation,
  imagesAssociation: images = [],
} = associationContent;


  const getImageGridClass = () => {
  if (images.length === 1) return 'grid-cols-1';
  if (images.length === 2) return 'grid-cols-2';
  if (images.length === 3) return 'grid-cols-3';
  return 'grid-cols-1';
};

if (!titreAssociation && !contentAssociation && images.length === 0) {
  return (
    <div className="pb-16 container-custom text-center text-gray-500">
      Aucune information à afficher pour l’association.
    </div>
  );
}


  return (
    <div className="pb-16">
      <SEO 
        title="Association des Jardins Familiaux, Jardins Partagés & Jardin Solidaire Villeurbanne | SJOV"
        description="Association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif à Villeurbanne depuis 1936. Jardin communal, jardins collectifs, jardin communautaire, jardins participatifs. Membre FNJFC. Demande jardins familiaux, jardinons à l'école."
        keywords="association jardins, association des jardins familiaux, jardins familiaux, jardin familiaux, les jardins familiaux, jardin ouvrier, jardin familial, jardins collectifs, jardins ouvriers, fnjfc, jardin communal, mon jardins, jardin partagé autour de moi, demande jardins familiaux, jardinons a l'ecole, jardiner a paris, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, SJOV, Société des Jardins Ouvriers de Villeurbanne, 69100, bénévolat, Rhône-Alpes, Lyon"
      />
      
      {/* Données structurées Schema.org pour améliorer le SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "SJOV - Société des Jardins Ouvriers de Villeurbanne",
          "alternateName": ["SJOV", "Association des Jardins Familiaux de Villeurbanne", "Jardins Ouvriers Villeurbanne", "Jardins Familiaux Villeurbanne"],
          "url": "https://sjov.fr/association",
          "logo": "https://sjov.fr/images/sjov-logo.png",
          "description": "Association des jardins familiaux et jardins ouvriers à Villeurbanne depuis 1936. Membre FNJFC. Demande jardins familiaux, jardin communal, jardins collectifs.",
          "foundingDate": "1936",
          "areaServed": ["Villeurbanne", "Vaulx-en-Velin", "Lyon", "Rhône-Alpes", "Auvergne-Rhône-Alpes"],
          "memberOf": {
            "@type": "Organization",
            "name": "FNJFC - Fédération Nationale des Jardins Familiaux et Collectifs"
          },
          "keywords": "jardins familiaux, jardin familiaux, association jardins, association des jardins familiaux, demande jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardinons a l'ecole, jardiner a paris, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs"
        })}
      </script>
      <div className="container-custom">
        <h1 className="font-heading font-bold text-4xl mb-2">
          {titreAssociation || "Notre association"}
        </h1>
        <p className="text-neutral-600 text-lg mb-8">
          Découvrez l'histoire et les valeurs de notre association de bénévoles.
        </p>

        <div className="mb-10">
          {!contentAssociation && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Notre association de bénévoles à Villeurbanne et Vaulx-en-Velin</h2>
              <p>
                La SJOV (Société des Jardins Ouvriers de Villeurbanne) est une association de bénévoles engagés depuis 1936 dans la promotion du jardinage urbain et écologique. Nous proposons des jardins partagés à Villeurbanne et Vaulx-en-Velin pour permettre aux habitants de cultiver leur propre parcelle dans un esprit de partage et de convivialité.
              </p>
              <h2 className="text-2xl font-semibold mt-6 mb-4">Nos jardins à Villeurbanne</h2>
              <p>
                Nos jardins partagés à Villeurbanne offrent un espace de nature en ville où vous pourrez cultiver fruits, légumes et plantes aromatiques tout en participant à une démarche écologique collective.              
              </p>
              <h2 className="text-2xl font-semibold mt-6 mb-4">Nos jardins à Vaulx-en-Velin</h2>
              <p>
                Découvrez nos espaces de jardinage à Vaulx-en-Velin, accessibles à tous les habitants souhaitant cultiver leur propre parcelle dans un esprit de partage et de convivialité.
              </p>
            </div>
          )}
          {contentAssociation && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: contentAssociation }}
            />
          )}
        </div>
        {images.length > 0 && (
          <div className={`grid gap-6 ${getImageGridClass()}`}>
            {images
              .filter((img): img is string => typeof img === 'string' && img !== null)
              .map((img, idx) => (
<img
  key={idx}
  src={img}
  alt={`Jardins partagés de la SJOV à ${idx % 2 === 0 ? 'Villeurbanne' : 'Vaulx-en-Velin'} - Association de bénévoles`}
  className="h-[500px] w-auto mx-auto object-contain"
/>

              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationPage;
