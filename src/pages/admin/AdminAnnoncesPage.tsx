import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { Annonce } from '../../types'; // ajuste le chemin si besoin
import { renderAnnonceType } from '../../constants/annonceTypes'; // ajuste le chemin si besoin
import { useNotifications } from '../../context/NotificationsContext';

const AdminAnnoncesPage = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedAnnonce, setEditedAnnonce] = useState<Partial<Annonce>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmImageDelete, setConfirmImageDelete] = useState<{ id: string; field: 'photo1' | 'photo2' } | null>(null);
  const { updateAnnoncesEnAttente } = useNotifications();

  const startEdit = (annonce: Annonce) => {
    setEditingId(annonce.id);
setEditedAnnonce({ ...annonce }); // copie indépendante

  };

  const saveEdit = async (id: string) => {
    await supabase.from('annonces').update(editedAnnonce).eq('id', id);
setEditedAnnonce({});
setEditingId(null);
    fetchAnnonces();
  };


  const fetchAnnonces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnonces(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnonces();
  }, []);

const validerAnnonce = async (id: string) => {
  await supabase.from('annonces').update({ statut: 'validé' }).eq('id', id);
  
  // Récupérer le nombre actuel d'annonces en attente depuis Supabase
  const { count } = await supabase
    .from('annonces')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'en_attente');
  
  // Mettre à jour le compteur de notifications
  updateAnnoncesEnAttente(count || 0);

  fetchAnnonces();
};


  const supprimerAnnonce = async (id: string) => {
    await supabase.from('annonces').delete().eq('id', id);
    fetchAnnonces();
  };

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Validation des petites annonces</h1>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => (<div key={i} className="h-10 bg-neutral-200 rounded-md" />))}</div>
      ) : annonces.length === 0 ? (
        <p className="text-center text-neutral-400 py-10 italic">Aucune annonce trouvée.</p>
      ) : (
        <div className="space-y-4">
          {annonces.map((annonce) => (
            <div
              key={annonce.id}
              className="bg-white rounded shadow p-4 space-y-2 border border-gray-200"
            >
              {editingId === annonce.id ? (
                <>
                  <input
                    value={editedAnnonce.nom || ''}
                    onChange={(e) => setEditedAnnonce({ ...editedAnnonce, nom: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Nom"
                  />
                  <input
                    value={editedAnnonce.email || ''}
                    onChange={(e) => setEditedAnnonce({ ...editedAnnonce, email: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Email"
                  />
                  <input
                    value={editedAnnonce.telephone || ''}
                    onChange={(e) => setEditedAnnonce({ ...editedAnnonce, telephone: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Téléphone"
                  />
                  <select
                    value={editedAnnonce.type || ''}
                    onChange={(e) =>
                      setEditedAnnonce({
                        ...editedAnnonce,
                        type: e.target.value as 'recherche' | 'vend' | 'donne' | 'échange',
                      })
                    }
                    className="border rounded px-2 py-2 w-full"
                  >
                    <option value="">-- Choisir --</option>
                    <option value="recherche">Recherche</option>
                    <option value="vend">Vend</option>
                    <option value="donne">Donne</option>
                    <option value="échange">Échange</option>
                  </select>
                  <textarea
                    value={editedAnnonce.contenu || ''}
                    onChange={(e) => setEditedAnnonce({ ...editedAnnonce, contenu: e.target.value })}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Contenu"
                  />
                </>
              ) : (
<>
  <div className="text-base font-medium text-gray-900">{annonce.nom}</div>
  <div className="text-base text-gray-600">{annonce.email} | {annonce.telephone}</div>
  <div className="text-base flex items-center gap-2">
    <span className="text-gray-700">Type :</span>
    {renderAnnonceType(annonce.type)}
  </div>
  <div className="text-base text-gray-800">{annonce.contenu}</div>
</>

              )}

              <div className="flex gap-4 pt-2">
{editingId === annonce.id
  ? editedAnnonce.photo1 && (
      <div className="flex flex-col items-start">
        <img src={editedAnnonce.photo1} className="h-24 rounded object-cover" alt="photo1" />
        <button
          onClick={() => setConfirmImageDelete({ id: annonce.id, field: 'photo1' })}
          className="text-red-600 text-sm mt-1 inline-block whitespace-nowrap"
        >
          Supprimer l’image
        </button>
      </div>
    )
  : annonce.photo1 && (
      <div className="flex flex-col items-start">
        <img src={annonce.photo1} className="h-24 rounded object-cover" alt="photo1" />
      </div>
    )}


{editingId === annonce.id
  ? editedAnnonce.photo2 && (
      <div className="flex flex-col items-start">
        <img src={editedAnnonce.photo2} className="h-24 rounded object-cover" alt="photo2" />
        <button
          onClick={() => setConfirmImageDelete({ id: annonce.id, field: 'photo2' })}
          className="text-red-600 text-sm mt-1 inline-block whitespace-nowrap"
        >
          Supprimer l’image
        </button>
      </div>
    )
  : annonce.photo2 && (
      <div className="flex flex-col items-start">
        <img src={annonce.photo2} className="h-24 rounded object-cover" alt="photo2" />
      </div>
    )}

              </div>

              <div className="flex gap-4 pt-3">
                {annonce.statut === 'en_attente' && editingId !== annonce.id && (
                  <button
                    onClick={() => validerAnnonce(annonce.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Valider
                  </button>
                )}

                {editingId === annonce.id ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-neutral-400 text-white px-4 py-2 rounded hover:bg-neutral-500"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => saveEdit(annonce.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Mettre à jour
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(annonce)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Modifier
                  </button>
                )}

                <button
                  onClick={() => setConfirmId(annonce.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>

              {confirmId === annonce.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4 text-red-700">Confirmation</h2>
                    <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette annonce ?</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-4 py-2 bg-neutral-400 text-white rounded hover:bg-neutral-500"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={async () => {
                          await supprimerAnnonce(confirmId);
                          setConfirmId(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
{confirmImageDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
      <h2 className="text-xl font-semibold mb-4 text-red-700">Confirmer la suppression</h2>
      <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette image ?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setConfirmImageDelete(null)}
          className="px-4 py-2 bg-neutral-400 text-white rounded hover:bg-neutral-500"
        >
          Annuler
        </button>
        <button
onClick={() => {
  if (!confirmImageDelete) return;
  if (editingId !== confirmImageDelete.id) return;

  const fieldToRemove = confirmImageDelete.field;
  setEditedAnnonce((prev) => ({ ...prev, [fieldToRemove]: null }));
  setConfirmImageDelete(null);
}}


          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default AdminAnnoncesPage;
