import React, { useEffect, useState } from 'react';
import { useContent } from '../../context/ContentContext';
import SuccessModal from '../../components/SuccessModal.tsx';
import RichTextEditor from '../../components/RichTextEditor';

const AdminSettingsPage: React.FC = () => {
const { associationContent, updateAssociationContent } = useContent();
const [localContent, setLocalContent] = useState(associationContent);
const [associationImageUploadedUrls, setAssociationImageUploadedUrls] = useState<(string | null)[]>([null, null, null]);
const [associationImagePreviews, setAssociationImagePreviews] = useState<(string | null)[]>([null, null, null]);

const [successMessage, setSuccessMessage] = useState<string | null>(null);
const [previewAccueil, setPreviewAccueil] = useState<string | null>(null);
const [previewHeaderIcon, setPreviewHeaderIcon] = useState<string | null>(null);
//const [parcellesOccupees, setParcellesOccupees] = useState<number>(associationContent.parcellesOccupees || 0);
//const [parcellesTotales, setParcellesTotales] = useState<number>(associationContent.parcellesTotal || 0);


const [contentAssociation, setContentAssociation] = useState<string>(''); // ← vide au départ
const [adresse, setAdresse] = useState(associationContent.adresse || '');
const [telephone, setTelephone] = useState(associationContent.telephone || '');
const [email, setEmail] = useState(associationContent.email || '');
const [horaires, setHoraires] = useState(associationContent.horaires || '');

const saveAssociationContent = async () => {
const updated = {
  id: associationContent.id,
  titreAccueil: localContent.titreAccueil || '',
  texteIntro: localContent.texteIntro || '',
  texteFooter: localContent.texteFooter || '',
  titreAssociation: localContent.titreAssociation || '',
  contentAssociation,
  imageAccueil: previewAccueil ?? localContent.imageAccueil,
  headerIcon: previewHeaderIcon ?? localContent.headerIcon,
  adresse,
  telephone,
  email,
  horaires,
imagesAssociation: associationImageUploadedUrls,
};


const refreshed = await updateAssociationContent(updated);
if (refreshed !== undefined) {
  setLocalContent({
    ...refreshed,
    contentAssociation: refreshed.contentAssociation || ''
  });
  setContentAssociation(refreshed.contentAssociation || '');
  setSuccessMessage('Tous les contenus ont été enregistrés.');
}


};



  const handleBase64Image = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'site_global_uploads');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/da2pceyci/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setter(data.secure_url);
    } catch (error) {
      setSuccessMessage('Erreur de téléchargement image');
      console.error(error);
    }
  };
const handleAssociationImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);
  const previews = [...associationImagePreviews];
  previews[index] = objectUrl;
  setAssociationImagePreviews(previews);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'site_global_uploads');

    const res = await fetch('https://api.cloudinary.com/v1_1/da2pceyci/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      const uploads = [...associationImageUploadedUrls];
      uploads[index] = data.secure_url;
      setAssociationImageUploadedUrls(uploads);
    }
  } catch (err) {
    console.error('Erreur upload image', err);
  }
};


const saveImage = async () => {
  if (!previewAccueil) {
    setSuccessMessage("Aucune image d’accueil à enregistrer.");
    return;
  }

  const updated = {
    id: associationContent.id,
    imageAccueil: previewAccueil,
  };

  const refreshed = await updateAssociationContent(updated);
if (refreshed !== undefined) {    setLocalContent(refreshed);
    setSuccessMessage("Image d’accueil enregistrée.");
  }
};



const saveHeaderIcon = async () => {
  if (!previewHeaderIcon) {
    setSuccessMessage("Aucune icône à enregistrer.");
    return;
  }

  const updated = {
    id: associationContent.id,
    headerIcon: previewHeaderIcon,
  };

  const refreshed = await updateAssociationContent(updated);
if (refreshed !== undefined) {    setLocalContent(refreshed);
    setSuccessMessage("Icône de header enregistrée.");
  }
};





useEffect(() => {
  if (
    associationContent &&
    !hasInitializedContent.current
  ) {
    setLocalContent({
      id: associationContent.id,
      titreAccueil: associationContent.titreAccueil || '',
      texteIntro: associationContent.texteIntro || '',
      texteFooter: associationContent.texteFooter || '',
      titreAssociation: associationContent.titreAssociation || '',
      parcellesOccupees: associationContent.parcellesOccupees || 0,
      parcellesTotal: associationContent.parcellesTotal || 0,
      imagesAssociation: associationContent.imagesAssociation || [null, null, null],
      adresse: associationContent.adresse || '',
      telephone: associationContent.telephone || '',
      email: associationContent.email || '',
      horaires: associationContent.horaires || '',
      imageAccueil: associationContent.imageAccueil ?? undefined,
      headerIcon: associationContent.headerIcon ?? undefined,
      contentAssociation: associationContent.contentAssociation || '',
    });

setAssociationImagePreviews(associationContent.imagesAssociation || [null, null, null]);
    setPreviewAccueil(associationContent.imageAccueil || null);
    setPreviewHeaderIcon(associationContent.headerIcon ?? null);
    setAdresse(associationContent.adresse || '');
    setTelephone(associationContent.telephone || '');
    setEmail(associationContent.email || '');
    setHoraires(associationContent.horaires || '');

    setContentAssociation(associationContent.contentAssociation || '');
    hasInitializedContent.current = true;
  }
}, [associationContent]);



const hasInitializedContent = React.useRef(false);



return (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>

    <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Page d’accueil - Image</h2>
        <div>
          <label className="block font-medium mb-1">Image d’accueil</label>
          <input type="file" accept="image/*" onChange={(e) => handleBase64Image(e, setPreviewAccueil)} />
          {previewAccueil && (
            <div>
              <img src={previewAccueil} alt="Aperçu" className="mt-2 h-48 rounded object-contain" />
              <button
                onClick={saveImage}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enregistrer l'image d'accueil
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Icône du header (logo site admin)</label>
          <input type="file" accept="image/*" onChange={(e) => handleBase64Image(e, setPreviewHeaderIcon)} />
          {previewHeaderIcon && (
            <div>
              <img src={previewHeaderIcon} alt="Aperçu header" className="mt-2 h-12 object-contain" />
              <button
                onClick={saveHeaderIcon}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enregistrer l’icône
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Page d’accueil - Textes</h2>
        <div>
          <label className="block font-medium mb-1">Titre de la page d’accueil</label>
<textarea
  className="w-full border px-3 py-2 rounded resize-none"
  rows={3}
value={localContent.titreAccueil || ''}
onChange={(e) => setLocalContent(prev => ({ ...prev, titreAccueil: e.target.value }))}
/>

        </div>
        <div>
          <label className="block font-medium mb-1">Texte d’introduction</label>
<textarea
  className="w-full border px-3 py-2 rounded resize-none"
  rows={5}
  value={localContent.texteIntro || ''}
onChange={(e) => setLocalContent(prev => ({ ...prev, texteIntro: e.target.value }))}
/>

        </div>
        <div>
          <label className="block font-medium mb-1">Texte pied de page (à gauche)</label>
<textarea
  className="w-full border px-3 py-2 rounded resize-none"
  rows={4}
  value={localContent.texteFooter || ''}
onChange={(e) => setLocalContent(prev => ({ ...prev, texteFooter: e.target.value }))}
/>

        </div>
<button
 onClick={saveAssociationContent}
   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Enregistrer les textes
</button>

      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Page notre association</h2>
        <div>
          <label className="block font-medium mb-1">Titre</label>




<input
  type="text"
  className="w-full border px-3 py-2 rounded"
  value={localContent.titreAssociation ?? ''}
  onChange={(e) => setLocalContent(prev => ({ ...prev, titreAssociation: e.target.value }))}
/>


        </div>

        <div>
          <label className="block font-medium mb-1">Contenu</label>
          <RichTextEditor
            value={contentAssociation}
            onChange={setContentAssociation}
            placeholder="Écrivez le contenu de la page association..."
            minHeight="300px"
          />


<div>
  <label className="block font-medium mb-1">Images de l’association (max 3)</label>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[0, 1, 2].map((index) => (
      <div key={index} className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleAssociationImageChange(e, index)}
          className="mb-2"
        />
        {associationImagePreviews[index] && (
          <div className="w-full flex justify-center">
            <img
              src={associationImagePreviews[index]!}
              alt={`Image ${index + 1}`}
              className="max-h-[500px] w-auto object-contain rounded"
            />
          </div>
        )}
        {associationImagePreviews[index] && (
          <button
            type="button"
            onClick={() => {
              const newPreviews = [...associationImagePreviews];
              const newUploads = [...associationImageUploadedUrls];
              newPreviews[index] = null;
              newUploads[index] = null;
              setAssociationImagePreviews(newPreviews);
              setAssociationImageUploadedUrls(newUploads);
            }}
            className="text-red-600 text-sm hover:underline mt-2"
          >
            Supprimer
          </button>
        )}
      </div>
    ))}
  </div>
</div>

        </div>


        <button
onClick={saveAssociationContent}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enregistrer le contenu
        </button>
      </div>


<div className="bg-white p-6 rounded-lg shadow space-y-6">
  <h2 className="text-xl font-semibold text-gray-800">Informations de contact</h2>

  <div>
    <label className="block font-medium mb-1">Adresse</label>
    <input
      type="text"
      className="w-full border px-3 py-2 rounded"
      value={adresse}
      onChange={(e) => setAdresse(e.target.value)}
    />
  </div>

  <div>
    <label className="block font-medium mb-1">Téléphone</label>
    <input
      type="text"
      className="w-full border px-3 py-2 rounded"
      value={telephone}
      onChange={(e) => setTelephone(e.target.value)}
    />
  </div>

  <div>
    <label className="block font-medium mb-1">Email</label>
    <input
      type="email"
      className="w-full border px-3 py-2 rounded"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  <div>
    <label className="block font-medium mb-1">Horaires</label>
    <input
      type="text"
      className="w-full border px-3 py-2 rounded"
      value={horaires}
      onChange={(e) => setHoraires(e.target.value)}
    />
  </div>

<button
onClick={async () => {
  const updated = {
    id: associationContent.id,
    adresse,
    telephone,
    email,
    horaires,
  };
  const refreshed = await updateAssociationContent(updated);
if (refreshed !== undefined) {    setLocalContent(refreshed);
    setSuccessMessage('Informations de contact enregistrées.');
  }
}}

  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Enregistrer les informations de contact
</button>

</div>


      <div className="h-10" />
      {successMessage && (
  <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
)}

    </div>
  );
};

export default AdminSettingsPage;
