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
        title="Association de Bénévoles de Jardins à Villeurbanne et Vaulx-en-Velin | SJOV"
        description="Association de bénévoles proposant des jardins partagés à Villeurbanne et Vaulx-en-Velin depuis 1936. La SJOV vous accompagne dans vos projets de jardinage urbain et écologique en Rhône-Alpes."
        keywords="association bénévole jardinage, jardins partagés Villeurbanne, jardins Vaulx-en-Velin, SJOV, Société des Jardins Ouvriers, 69100, bénévolat, jardinage écologique, Rhône-Alpes"
      />
      
      {/* Données structurées Schema.org pour améliorer le SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Société des Jardins Ouvriers de Villeurbanne",
          "alternateName": "SJOV",
          "url": "https://sjov.fr/association",
          "logo": "https://sjov.fr/images/sjov-logo.png",
          "description": "Association de bénévoles proposant des jardins partagés à Villeurbanne et Vaulx-en-Velin depuis 1936.",
          "foundingDate": "1936",
          "areaServed": ["Villeurbanne", "Vaulx-en-Velin", "Rhône-Alpes"],
          "keywords": "association bénévole, jardins partagés, Villeurbanne, Vaulx-en-Velin"
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
