import React, { useEffect, useRef, useState } from 'react';
import { BlogPost } from '../../types';
import { useContent } from '../../context/ContentContext';
import RichTextEditor from '../../components/RichTextEditor';

declare global {
  interface Window {
    lastUploadedCoverImage: string;
    lastUploadedImageUrl: string;
  }
}

const AdminBlogPage = () => {

const {
  blogPosts,
  addBlogPost,
  updateBlogPost,
  fetchBlogPosts,
  deleteBlogPost // 
} = useContent();

  const [imagesannexesFiles, setImagesannexesFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagesannexesUrls, setImagesannexesUrls] = useState<(string | null)[]>([null, null, null]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Gestion de l'upload de l'image de couverture
  const [error, setError] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  // Variable globale pour stocker l'URL de l'image uploadée (persiste entre les rendus)
  // Cette variable sera utilisée dans handleImageChange et handleSubmit
  if (typeof window !== 'undefined' && !window.lastUploadedCoverImage) {
    window.lastUploadedCoverImage = '';
  }

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
const [posts, setPosts] = useState<BlogPost[]>([]);
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

useEffect(() => {
  fetchBlogPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  setPosts(blogPosts);
}, [blogPosts]);



  const getImageGridClass = (images: (string | null)[]) => {
    const validCount = images.filter(img => img).length;
    if (validCount === 1) return 'grid-cols-1';
    if (validCount === 2) return 'grid-cols-2';
    if (validCount >= 3) return 'grid-cols-3';
    return '';
  };

  const handleImageAnnexeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en octets
    if (file.size > maxSize) {
      setError(`L'image ${index+1} est trop volumineuse (max 10MB). Veuillez la compresser.`);
      // Réinitialiser l'input
      const input = document.getElementById(`annex-image-${index}`) as HTMLInputElement | null;
      if (input) input.value = '';
      return;
    }

    setError(''); // Réinitialiser les erreurs précédentes
    
    const newFiles = [...imagesannexesFiles];
    newFiles[index] = file;
    setImagesannexesFiles(newFiles);

    const objectUrl = URL.createObjectURL(file);
    const newUrls = [...imagesannexesUrls];
    newUrls[index] = objectUrl;
    setImagesannexesUrls(newUrls);
  };

  // Fonction pour compresser une image avant upload
  const compressImage = async (file: File, maxSizeMB: number = 0.5): Promise<File> => {
    // Si l'image est déjà petite, ne pas la compresser
    if (file.size / 1024 / 1024 < maxSizeMB) {
      return file;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calculer les dimensions pour garder le ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200; // Dimension maximale
          
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Qualité de compression (0.7 = 70%)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Échec de la compression'));
                return;
              }
              
              // Créer un nouveau fichier avec le même nom mais compressé
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve(newFile);
            },
            'image/jpeg',
            0.7
          );
        };
        
        img.onerror = () => {
          reject(new Error("Erreur lors du chargement de l'image"));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
    });
  };

  const uploadAnnexImages = async (): Promise<string[]> => {
    setIsUploading(true); // Indiquer que l'upload est en cours
    
    // Créer un tableau pour les nouvelles URLs
    const urls: (string | null)[] = [];
    const maxRetries = 1; // Réduire le nombre de tentatives
    
    try {
      // Préparer les promesses d'upload pour chaque fichier
      const uploadPromises = imagesannexesFiles.map(async (file, i) => {
        // Si l'URL existe déjà et n'est pas un fichier nouvellement ajouté, la conserver
        if (!file && imagesannexesUrls[i]) {
          return { index: i, url: imagesannexesUrls[i] };
        }
        
        // Si c'est null (supprimé) ou pas de fichier, mettre null
        if (!file) {
          return { index: i, url: null };
        }
        
        // Compresser l'image avant upload
        let compressedFile;
        try {
          compressedFile = await compressImage(file);
        } catch (err) {
          // En cas d'échec de compression, utiliser le fichier original
          compressedFile = file;
        }
        
        // Uploader le fichier compressé
        let retryCount = 0;
        let success = false;
        let resultUrl = null;
        
        while (retryCount <= maxRetries && !success) {
          try {
            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', 'site_global_uploads');
            
            const res = await fetch('https://api.cloudinary.com/v1_1/da2pceyci/image/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!res.ok) {
              throw new Error(`Erreur HTTP: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.secure_url) {
              resultUrl = data.secure_url;
              success = true;
            } else {
              throw new Error('URL sécurisée non reçue de Cloudinary');
            }
          } catch (err) {
            retryCount++;
            
            if (retryCount > maxRetries) {
              // Erreur silencieuse pour ne pas bloquer les autres uploads
              resultUrl = null;
            } else {
              // Attendre avant de réessayer (backoff réduit)
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        return { index: i, url: resultUrl };
      });
      
      // Exécuter tous les uploads en parallèle
      const results = await Promise.all(uploadPromises);
      
      // Traiter les résultats
      results.forEach(result => {
        urls[result.index] = result.url;
      });
      
      // Vérifier s'il y a eu des erreurs
      const failedUploads = results.filter(r => r.url === null && imagesannexesFiles[r.index] !== null);
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} image(s) n'ont pas pu être uploadées. Veuillez réessayer.`);
      }
      
      return urls as string[];
    } catch (error) {
      setError("Erreur lors de l'upload des images annexes");
      return [];
    } finally {
      setIsUploading(false); // Indiquer que l'upload est terminé
    }
  };  

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  // Variable globale pour stocker l'URL de l'image de couverture en dehors du composant
// pour éviter qu'elle ne soit réinitialisée à chaque rendu
if (typeof window !== 'undefined') {
  if (!window.lastUploadedImageUrl) {
    window.lastUploadedImageUrl = '';
  }
}

const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setError(''); // Réinitialiser les erreurs précédentes
  setImage(file);
  setPreviewUrl(URL.createObjectURL(file));
  
  // Désactiver le bouton de soumission pendant l'upload
  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  if (submitButton) submitButton.disabled = true;
  
  // Afficher un message d'attente
  setError('Upload en cours... Veuillez patienter.');
    
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'site_global_uploads');

    const res = await fetch('https://api.cloudinary.com/v1_1/da2pceyci/image/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
    
    const data = await res.json();
    if (data.secure_url) {
      // Mettre à jour l'URL uploadée et s'assurer qu'elle est bien enregistrée
      const secureUrl = data.secure_url;
      
      // Stocker l'URL dans la variable globale sur window
      window.lastUploadedCoverImage = secureUrl;
      
      // Mettre à jour l'état React
      setUploadedImageUrl(secureUrl);

      // Effacer le message d'erreur/attente
      setError('');
      
      // Réactiver le bouton de soumission
      if (submitButton) submitButton.disabled = false;
    } else {
      throw new Error('URL sécurisée non reçue de Cloudinary');
    }
  } catch (err) {
    console.error('❌ Erreur upload image de couverture:', err);
    setError("Erreur lors de l'upload de l'image de couverture. Veuillez réessayer.");
    // Réinitialiser l'état pour permettre une nouvelle tentative
    setImage(null);
    setPreviewUrl('');
    setUploadedImageUrl('');
    window.lastUploadedCoverImage = '';
    const fileInput = document.getElementById('blog-image') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    
    // Réactiver le bouton de soumission en cas d'erreur
    if (submitButton) submitButton.disabled = false;
  }
};


const handleSubmit = async () => {
  let newUploadedUrls: string[] = [];

  if (!title || !content.trim()) {
    setError("Le titre et le contenu sont requis.");
    return;
  }
  
  // Désactiver le bouton de soumission pendant la vérification
  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  if (submitButton) submitButton.disabled = true;

  // Vérifier que l'image de couverture est présente
  // Utiliser la variable globale sur window comme source fiable
  let finalImageUrl = uploadedImageUrl || window.lastUploadedCoverImage || '';

  // Si nous avons une prévisualisation mais pas d'URL finale, c'est que l'upload est peut-être en cours
  // Attendre un peu et réessayer
  if (!finalImageUrl && previewUrl) {
    setError("Finalisation de l'upload... Veuillez patienter.");
    
    // Attendre 2 secondes et vérifier à nouveau
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Vérifier à nouveau après le délai
    finalImageUrl = uploadedImageUrl || window.lastUploadedCoverImage || '';
  }

  // Réactiver le bouton de soumission
  if (submitButton) submitButton.disabled = false;

  if (!finalImageUrl) {
    if (previewUrl) {
      setError("L'image est en cours de traitement. Veuillez réessayer dans quelques secondes.");
    } else {
      setError("La photo de couverture est requise.");
    }
    return;
  }

  try {
    setError('');
    newUploadedUrls = await uploadAnnexImages();
  } catch (err) {
    setError('Erreur lors de la sauvegarde des images annexes. Veuillez réessayer.');
    return;
  }

  // Filtrer les valeurs null pour le payload final
  let finalImagesAnnexes: string[] = [];
  
  // Combiner les URLs existantes et les nouvelles URLs
  if (editingPost && editingPost.imagesannexes) {
    finalImagesAnnexes = newUploadedUrls.filter(url => url !== null) as string[];
  } else {
    // En mode création, simplement filtrer les null
    finalImagesAnnexes = newUploadedUrls.filter(url => url !== null) as string[];
    
    // Éliminer les doublons tout en préservant l'ordre
    finalImagesAnnexes = finalImagesAnnexes.filter((url, index, self) => 
      self.indexOf(url) === index
    );
  }
  
  const fileInput = document.getElementById('blog-image') as HTMLInputElement | null;
  if (fileInput) {
    fileInput.value = '';
  }

  // S'assurer que l'image n'est jamais null pour satisfaire le typage
  const finalImage = finalImageUrl as string; // On a déjà vérifié qu'il n'est pas null plus haut
  
  const payload = {
    title,
    content: content,
    image: finalImage,  // photo couverture avec l'URL garantie
    imagesannexes: finalImagesAnnexes, // tableau propre avec gestion des suppressions
    excerpt: '',
    author: 'Admin',
    date: new Date().toISOString(),
  };

  try {
    if (editingPost) {
      await updateBlogPost(editingPost.id, payload);
      setEditingPost(null);
    } else {
      await addBlogPost(payload);
    }

    await fetchBlogPosts();
    
    // reset après succès
    setTitle('');
    setContent('');
    setImage(null);
    setPreviewUrl('');
    setUploadedImageUrl('');
    // Nettoyer aussi la variable globale sur window
    window.lastUploadedCoverImage = '';
    setImagesannexesFiles([null, null, null]);
    
    // Réinitialise les inputs annexes pour éviter l'affichage persistant des noms
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const input = document.getElementById(`annex-image-${i}`) as HTMLInputElement | null;
        if (input) input.value = '';
      }
    }, 0);

    setImagesannexesUrls([null, null, null]);
    setError('');
    
    // Quitter le mode édition et forcer la mise à jour de l'UI
    setEditingPost(null);
    
    // Faire défiler vers le haut pour voir la liste mise à jour
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (err) {
    console.error('Erreur lors de la création ou mise à jour :', err);
    setError('Une erreur est survenue pendant l\'enregistrement.');
  }
};




const handleEdit = async (post: BlogPost & { imagesannexes?: (string | null)[] }) => {
    setTitle(post.title);
    setContent(post.content);
    setEditingPost(post);
    setUploadedImageUrl(post.image);

    setPreviewUrl(post.image);

    // Récupère les URLs des images annexes et complète à 3 avec des null pour garder la taille
    const filteredUrls = (post.imagesannexes ?? []).filter((url): url is string => url !== null);
    const urlsWithNulls: (string | null)[] = [...filteredUrls];
    while (urlsWithNulls.length < 3) {
      urlsWithNulls.push(null);
    }


// Crée des faux fichiers virtuels pour afficher les noms existants
// Crée des faux fichiers virtuels et regénère les aperçus
const dummyFiles: (File | null)[] = await Promise.all(urlsWithNulls.map(async (url) => {
  if (!url) return null;
  const filename = url.split('/').pop() || '';
  const blob = await fetch(url).then(res => res.blob());
  return new File([blob], filename, { type: blob.type });
}));
setImagesannexesFiles(dummyFiles);

// Réinjecte les aperçus à partir des URLs
setImagesannexesUrls(urlsWithNulls);


if (post.image) {
  const filename = post.image.split('/').pop() || '';
  const blob = await fetch(post.image).then(res => res.blob());
  const file = new File([blob], filename, { type: blob.type });
  setImage(file);
  setUploadedImageUrl(post.image); // utile si jamais supprimé plus tard

  const objectUrl = URL.createObjectURL(file);
  setPreviewUrl(objectUrl);

  const fileInput = document.getElementById('blog-image') as HTMLInputElement | null;
  if (fileInput) fileInput.value = '';
}






    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6 pb-16">
      <h1 className="text-3xl font-bold text-gray-800">Gestion des articles de blog</h1>

      <h2 className="text-xl font-semibold text-gray-800">
        {editingPost ? 'Modifier un article' : 'Créer un article'}
      </h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {error && <p className="text-red-600 font-medium">{error}</p>}

        <input
          type="text"
          placeholder="Titre de l'article"
          className="w-full border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Écrivez le contenu de votre article..."
          minHeight="300px"
        />

<div className="space-y-2 mt-4">
  <label className="block font-medium">Photo de couverture</label>

<input
  id="blog-image"
  type="file"
  accept="image/*"
  onChange={handleImageChange}
  className={`w-full ${previewUrl ? 'text-transparent' : ''}`}
/>






  {previewUrl && (
    <div className="mt-2">
      <img src={previewUrl} alt="Aperçu" className="h-32 object-cover rounded" />
      <button
        type="button"
        onClick={() => {
          setImage(null);
          setPreviewUrl('');
          setUploadedImageUrl('');
          const fileInput = document.getElementById('blog-image') as HTMLInputElement | null;
          if (fileInput) fileInput.value = '';
        }}
        className="text-red-600 text-sm hover:underline mt-2"
      >
        Supprimer l’image
      </button>
    </div>
  )}
</div>




        <div className="space-y-2 mt-4">
          <label className="block font-medium">Photos de contenu (jusqu’à 3)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {imagesannexesUrls.map((imgUrl, index) => (
  <div key={index}>
<input
  ref={(el) => (inputRefs.current[index] = el)}
  id={`annex-image-${index}`}
  type="file"
  accept="image/*"
className={`w-full ${imagesannexesUrls[index] ? 'text-transparent' : ''}`}
  onChange={(e) => handleImageAnnexeChange(index, e)}
/>







    {imgUrl && (
      <div className="mt-2 relative">
        <img
          src={imgUrl}
          alt={`Aperçu annexe ${index + 1}`}
          className="w-full h-32 object-cover rounded"
        />
        <button
          onClick={() => {
            const newFiles = [...imagesannexesFiles];
            newFiles[index] = null;
            setImagesannexesFiles(newFiles);
            const newUrls = [...imagesannexesUrls];
            newUrls[index] = null;
            setImagesannexesUrls(newUrls);
            const input = document.getElementById(`annex-image-${index}`) as HTMLInputElement | null;
            if (input) input.value = '';
          }}
          className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs"
          type="button"
        >
          Supprimer
        </button>
      </div>
    )}
  </div>
))}

          </div>
        </div>

<div className="flex flex-wrap gap-2 mt-4">
  <button
    onClick={handleSubmit}
    disabled={isUploading}
    className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} text-white px-4 py-2 rounded flex items-center`}
  >
    {isUploading && (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )}
    {editingPost ? (isUploading ? 'Mise à jour...' : 'Mettre à jour') : (isUploading ? 'Publication...' : 'Publier')}
  </button>

  {editingPost && (
    <>
      <button
        onClick={() => {
          setTitle('');
          setContent('');
          setImage(null);
          setPreviewUrl('');
          setUploadedImageUrl('');
          setImagesannexesFiles([null, null, null]);
          setImagesannexesUrls([null, null, null]);
          setEditingPost(null);
          setError('');
          const fileInput = document.getElementById('blog-image') as HTMLInputElement | null;
          if (fileInput) fileInput.value = '';
          window.scrollTo(0, 0);
        }}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        Annuler
      </button>

      <button
        onClick={() => {
          setPostToDelete(editingPost);
          setShowConfirm(true);
        }}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Supprimer
      </button>
    </>
  )}
</div>



{showConfirm && postToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Confirmer la suppression
      </h3>
      <p className="text-gray-600 mb-6">
        Êtes-vous sûr de vouloir supprimer l’article "<strong>{postToDelete.title}</strong>" ? Cette action est irréversible.
      </p>
      <div className="flex justify-center gap-4">
        <button
onClick={async () => {
  const isEditingDeleted = editingPost?.id === postToDelete.id;
  await deleteBlogPost(postToDelete.id);
  await fetchBlogPosts();

  setPostToDelete(null);
  setShowConfirm(false);

  if (isEditingDeleted) {
    setTitle('');
    setContent('');
    setImage(null);
    setPreviewUrl('');
    setUploadedImageUrl('');
    setImagesannexesFiles([null, null, null]);
    setImagesannexesUrls([null, null, null]);
    setEditingPost(null);
    setError('');

    const fileInput = document.getElementById('blog-image') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';

    for (let i = 0; i < 3; i++) {
      const input = document.getElementById(`annex-image-${i}`) as HTMLInputElement | null;
      if (input) input.value = '';
    }
  }

  window.scrollTo(0, 0);
}}

          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Supprimer
        </button>
        <button
          onClick={() => {
            setPostToDelete(null);
            setShowConfirm(false);
          }}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
      </div>
    </div>
  </div>
)}


      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Articles publiés</h2>
        {posts.length === 0 ? (
          <p className="text-neutral-500 mt-2">Aucun billet publié.</p>
        ) : (
          posts.map(post => (
<div key={post.id} className="bg-white p-4 rounded shadow-sm space-y-2 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
              {post.image && <img src={post.image} alt="illustration" className="h-32 object-cover rounded" />}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

              <div className={`mt-2 grid gap-2 ${getImageGridClass(post.imagesannexes ?? [])}`}>
                {(post.imagesannexes ?? []).map((img: string | null, i: number) =>
                  img ? (
                    <img
                      key={i}
                      src={img}
                      alt={`Image annexe ${i + 1}`}
                      className="h-24 object-cover rounded w-full"
                    />
                  ) : null
                )}
              </div>

<div className="flex gap-4 pt-2">
  <button
    onClick={() => handleEdit(post)}
    className="text-blue-600 text-sm hover:underline"
  >
    Modifier
  </button>
  <button
onClick={() => {
  setPostToDelete(post);
  setShowConfirm(true);
}}

    className="text-red-600 text-sm hover:underline"
  >
    Supprimer
  </button>

</div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminBlogPage;
