import React, { useState, useRef } from 'react';
import { useContent } from '../context/ContentContext';
import { supabase } from '../supabaseClient';
import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { useLocation } from 'react-router-dom';
import { renderAnnonceType } from '../constants/annonceTypes'; // ajuste le chemin si besoin
import SEO from '../components/SEO';



const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
formData.append('upload_preset', 'site_global_uploads');

  try {
    console.log('📤 Envoi Cloudinary :', {
  fileName: file.name,
  size: file.size,
  type: file.type,
});
const res = await fetch('https://api.cloudinary.com/v1_1/da2pceyci/image/upload', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
  body: formData,
});

console.log("📥 Cloudinary Response Status:", res.status);

    const data = await res.json();

    if (!res.ok || !data.secure_url) {
      console.error('Erreur Cloudinary :', data);
      return null;
    }

    return data.secure_url;
  } catch (err) {
    console.error('Exception Cloudinary :', err);
    return null;
  }
};

const AnnoncesPage: React.FC = () => {
const { annonces, fetchAnnonces } = useContent();
const { updateAnnoncesEnAttente } = useNotifications();
const sortedAnnonces = [...annonces]
  .filter(a => a.statut === 'validé')
  .sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
const location = useLocation();

useEffect(() => {
  if (!location.hash) return;
  try {
    const target = document.querySelector(location.hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  } catch (e) {
    console.warn("Sélecteur invalide :", location.hash);
  }
}, [location]);

const [formData, setFormData] = useState<{
  nom: string;
  email: string;
  telephone: string;
  type: string;
  contenu: string;
  photo1: File | null;
  photo2: File | null;
}>({
    nom: '',
    email: '',
    telephone: '',
    type: '',
    contenu: '',
    photo1: null,
    photo2: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
const toggleType = (type: string) => {
  setSelectedTypes((prev) => {
    // Premier clic => on isole le type cliqué
    if (prev.length === 0) {
      return [type];
    }

    // Si déjà sélectionné => on le retire
    if (prev.includes(type)) {
      const updated = prev.filter((t) => t !== type);
      return updated;
    }

    // Sinon, on ajoute (filtrage cumulatif)
    return [...prev, type];
  });
};

const visibleAnnonces = sortedAnnonces.filter(
  (a) => selectedTypes.length === 0 || selectedTypes.includes(a.type)
);

const photo1Ref = useRef<HTMLInputElement>(null);
const photo2Ref = useRef<HTMLInputElement>(null);
const [fullscreenImage, setFullscreenImage] = useState<{ current: string; next?: string } | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.nom || !formData.telephone || !formData.type) {
    alert('Les champs obligatoires (*) doivent être remplis.');
    return;
  }
const captcha = document.querySelector<HTMLInputElement>('input[placeholder="Écrire: SJOV"]');
if (!captcha || captcha.value.trim().toLowerCase() !== 'sjov') {
  alert("Captcha incorrect. Veuillez écrire : SJOV");
  return;
}
const photo1Url = formData.photo1 ? await uploadToCloudinary(formData.photo1) : '';
const photo2Url = formData.photo2 ? await uploadToCloudinary(formData.photo2) : '';

console.log("Photo 1 URL =>", photo1Url);
console.log("Photo 2 URL =>", photo2Url);


const { error } = await supabase.from('annonces').insert([{
  nom: formData.nom,
  email: formData.email,
  telephone: formData.telephone,
  type: formData.type,
  contenu: formData.contenu,
  photo1: photo1Url,
  photo2: photo2Url,
  statut: 'en_attente'
}]);

// Récupérer le nombre actuel d'annonces en attente depuis Supabase
const { count } = await supabase
  .from('annonces')
  .select('*', { count: 'exact', head: true })
  .eq('statut', 'en_attente');

// Mettre à jour le compteur de notifications
updateAnnoncesEnAttente(count || 0);


  if (error) {
    alert("Erreur lors de l'envoi de l'annonce");
    return;
  }

 
  await fetchAnnonces();
 setSubmitted(true);
document.getElementById('poster')?.scrollIntoView({ behavior: 'smooth' });

};
useEffect(() => {
  setSubmitted(false);
  setFormData({
    nom: '',
    email: '',
    telephone: '',
    type: '',
    contenu: '',
    photo1: null,
    photo2: null
  });
  if (photo1Ref.current) photo1Ref.current.value = '';
  if (photo2Ref.current) photo2Ref.current.value = '';
}, [location.pathname]);

  return (
    <div className="pb-16">
      <SEO 
        title="Annonces Jardins Familiaux, Jardins Partagés & Jardin Solidaire SJOV Villeurbanne"
        description="Petites annonces de l'association des jardins familiaux, jardins partagés, jardin solidaire et potager collectif SJOV. Jardins collectifs, jardin communal, jardin communautaire, jardins participatifs. Échanges plants, dons graines. Membre FNJFC à Villeurbanne depuis 1936."
        keywords="jardins familiaux, jardin familiaux, les jardins familiaux, association jardins, association des jardins familiaux, jardin ouvrier, jardin familial, fnjfc, jardin communal, mon jardins, jardin partagé autour de moi, jardins collectifs, jardins ouvriers, demande jardins familiaux, jardinons a l'ecole, jardiner a paris, jardin solidaire, jardin partagé, jardins partages, jardin communale, potager collectif, jardin collectif, les jardins partagés, jardin communautaire, jardin en partage, jardin commun, législation jardins partagés, jardin locatif, jardins participatifs, annonces jardinage, échange plants, vente matériel jardinage, dons graines, SJOV, Société des Jardins Ouvriers de Villeurbanne, Villeurbanne, 69100, Rhône-Alpes, Lyon, bénévolat, troc plantes"
      />
      <div className="container-custom">
<h1 className="font-heading font-bold text-4xl mb-2">Les petites annonces</h1>

<p className="text-neutral-600 text-lg mb-4">
  Retrouvez ici les annonces de particulier à particulier.
</p>

<div className="flex flex-wrap gap-2 mb-6">
  {['recherche', 'vend', 'donne', 'échange'].map((type) => {
    const count = sortedAnnonces.filter(a => a.type === type).length;
    if (count === 0) return null;

    const isSelected = selectedTypes.includes(type);
    const colorMap: Record<string, string> = {
      recherche: 'bg-blue-500 text-white',
      vend: 'bg-yellow-500 text-white',
      donne: 'bg-green-600 text-white',
      échange: 'bg-amber-800 text-white'
    };
    const grayStyle = 'bg-gray-200 text-gray-700';

    return (
      <button
        key={type}
        onClick={() => toggleType(type)}
className={`flex items-center gap-2 px-4 py-2 rounded transition ${
  isSelected
    ? `${colorMap[type]} hover:text-white`
    : `${grayStyle} hover:text-black`
}`}      >
        {renderAnnonceType(type, isSelected)}
      </button>
    );
  })}
<a
  href="#poster"
  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-base text-center transition-colors duration-200 !text-white font-semibold"
>
  PUBLIER UNE ANNONCE
</a>
</div>



        {/* Liste des annonces */}
        {sortedAnnonces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{visibleAnnonces.map((post) => (
<div key={post.id} id={`annonce-${post.id}`} className="border rounded-lg p-4 bg-white shadow">
<p className="text-sm text-neutral-400 mb-1">
  {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Date inconnue'}
</p>
<div className="text-lg font-semibold mb-2">{renderAnnonceType(post.type)}</div>
                <p className="text-neutral-700 whitespace-pre-line">{post.contenu}</p>
<p className="text-sm text-neutral-500 italic mt-2">
  {post.nom} • {post.telephone} {post.email && `• ${post.email}`}
</p>
{(post.photo1 || post.photo2) && (
  <div className="flex gap-3 mt-3">
    {post.photo1 && (
      <img
        src={post.photo1}
        alt="photo1"
        className="w-32 h-32 object-cover rounded cursor-pointer"
        onClick={() =>
          setFullscreenImage({ current: post.photo1 || '', next: post.photo2 || undefined })
        }
      />
    )}
    {post.photo2 && (
      <img
        src={post.photo2}
        alt="photo2"
        className="w-32 h-32 object-cover rounded cursor-pointer"
        onClick={() =>
          setFullscreenImage({ current: post.photo2 || '', next: post.photo1 || undefined })
        }
      />
    )}
  </div>
)}            

</div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center">Aucune annonce pour le moment.</p>
        )}

                {/* Formulaire de soumission */}
<h2 id="poster" className="text-2xl font-heading font-semibold mt-16 mb-4">
  Publier une nouvelle annonce
</h2>
        <div className="bg-white p-6 rounded-2xl shadow mb-12">
          {submitted ? (
            <p className="text-green-600 font-medium">Annonce envoyée, en attente de validation.</p>
          ) : (
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
<div className="w-full">
  <label className="block font-medium mb-1 text-sm text-gray-700">Nom Prénom *</label>
<input
  type="text"
  name="nom"
  value={formData.nom}
  onChange={handleChange}
  className="w-full border px-3 py-2 rounded"
  required
/>
              </div>

<div className="w-full">
  <label className="block font-medium mb-1 text-sm text-gray-700">Adresse Email</label>
<input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  className="w-full border px-3 py-2 rounded"
/>
              </div>

<div className="w-full">
  <label className="block font-medium mb-1 text-sm text-gray-700">Numéro de téléphone *</label>
<input
  type="tel"
  name="telephone"
  value={formData.telephone}
  onChange={handleChange}
  className="w-full border px-3 py-2 rounded"
  required
/>
              </div>

<div className="w-full">
  <label className="block font-medium mb-1 text-sm text-gray-700">Type d'annonce *</label>
<select
  name="type"
  value={formData.type}
  onChange={handleChange}
  className="w-full border px-3 py-2 rounded"
  required
>
  <option value="">-- Choisir --</option>
  <option value="recherche">Recherche</option>
  <option value="vend">Vend</option>
  <option value="donne">Donne</option>
  <option value="échange">Échange</option>
</select>

              </div>
              <div className="col-span-2">
                <label className="font-medium">Contenu de l'annonce</label>
                <textarea name="contenu" value={formData.contenu} onChange={handleChange} className="w-full border px-3 py-2 rounded" rows={4} />
              </div>
<div className="flex flex-col md:flex-row gap-6 items-start w-full">
<div className="w-full md:w-1/2">
  <label className="block font-medium mb-1 text-sm text-gray-700">Photo 1</label>
  <input
    ref={photo1Ref}
    type="file"
    name="photo1"
    accept="image/*"
    onChange={(e) =>
      setFormData((prev) => ({ ...prev, photo1: e.target.files?.[0] ?? null }))
    }
    className="block w-full text-sm text-gray-700 border rounded px-3 py-2"
  />
  {formData.photo1 && (
    <div className="relative mt-2 w-32">
      <img
        src={URL.createObjectURL(formData.photo1)}
        alt="Aperçu photo 1"
        className="w-32 h-32 object-cover rounded border"
      />
      <button
        type="button"
        onClick={() => {
          setFormData((prev) => ({ ...prev, photo1: null }));
          if (photo1Ref.current) photo1Ref.current.value = '';
        }}
        className="text-red-600 text-xs mt-1 inline-block"
      >
        Supprimer l’image
      </button>
    </div>
  )}
</div>


<div className="w-full md:w-1/2">
  <label className="block font-medium mb-1 text-sm text-gray-700">Photo 2</label>
  <input
    ref={photo2Ref}
    type="file"
    name="photo2"
    accept="image/*"
    onChange={(e) =>
      setFormData((prev) => ({ ...prev, photo2: e.target.files?.[0] ?? null }))
    }
    className="block w-full text-sm text-gray-700 border rounded px-3 py-2"
  />
  {formData.photo2 && (
    <div className="relative mt-2 w-32">
      <img
        src={URL.createObjectURL(formData.photo2)}
        alt="Aperçu photo 2"
        className="w-32 h-32 object-cover rounded border"
      />
      <button
        type="button"
        onClick={() => {
          setFormData((prev) => ({ ...prev, photo2: null }));
          if (photo2Ref.current) photo2Ref.current.value = '';
        }}
        className="text-red-600 text-xs mt-1 inline-block"
      >
        Supprimer l’image
      </button>
    </div>
  )}
</div>



</div>

<div className="col-span-2">
  <label className="font-medium">Captcha</label>
  <input type="text" placeholder="Écrire: SJOV" className="w-full border px-3 py-2 rounded" required />
</div>

<div className="col-span-2">
  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
    Envoyer
  </button>
</div>
            </form>
          )}
        </div>

      </div>
      {fullscreenImage && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    onClick={() => setFullscreenImage(null)}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
<img src={fullscreenImage.current || ''} className="max-h-[80vh] max-w-[90vw] rounded shadow-lg" />      {fullscreenImage.next && (
  <button
    onClick={() =>
setFullscreenImage({
  current: fullscreenImage.next || '',
  next: fullscreenImage.current || ''
})    }
    className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white text-2xl bg-black/50 px-2 rounded"
  >
    ←
  </button>
)}
{fullscreenImage.next && (
  <button
    onClick={() =>
      setFullscreenImage({
        current: fullscreenImage.next as string,
        next: fullscreenImage.current
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
      >✕</button>
    </div>
  </div>
)}
    </div>
  );
};

export default AnnoncesPage;
