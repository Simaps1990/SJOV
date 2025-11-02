import * as React from 'react';
import SuccessModal from '../../components/SuccessModal.tsx';
import { supabase } from '../../supabaseClient';
import { useNotifications } from '../../context/NotificationsContext';

type Demande = {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  telephoneportable: string;
  telephonefixe: string;
  email: string;
  taillejardin: string;
  experience: string;
  budgetconnu: string;
  tempsdisponible: string;
  inspectionconnu: string;
  engagementcharte: string;
  engagementreglement: string;
  engagementlieupublic: string;
  motivations: string;
  date: string;
  processed: boolean;
  archived?: boolean;
  archived_date?: string;
};


const AdminApplicationsPage: React.FC = () => {
const [demandes, setDemandes] = React.useState<Demande[]>([]);
const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
const [showConfirmModal, setShowConfirmModal] = React.useState(false);
const [demandeASupprimer, setDemandeASupprimer] = React.useState<Demande | null>(null);
const { updateNonTraitees } = useNotifications();


React.useEffect(() => {
  const fetchDemandes = async () => {
const { data, error } = await supabase
  .from('applications')  // Sans <Demande, Demande>
.select('*')
.order('date', { ascending: false });



    if (error) {
      console.error('Erreur de chargement des demandes Supabase :', error.message);
      return;
    }
    setDemandes(data || []);
  };

  fetchDemandes();
}, []);

const toggleProcessed = async (demande: Demande) => {
  const { error } = await supabase
    .from('applications')
    .update({ processed: !demande.processed })
    .eq('id', demande.id);

  if (error) {
    console.error('Erreur lors de la mise à jour :', error);
  } else {
setDemandes((prev) => {
  const updated = prev.map((d) => (d.id === demande.id ? { ...d, processed: !demande.processed } : d));
  localStorage.setItem('applications', JSON.stringify(updated));
  // Mettre à jour le compteur de notifications
  const nonTraiteesCount = updated.filter(d => !d.processed && !d.archived).length;
  updateNonTraitees(nonTraiteesCount);
  return updated;
});

    setSuccessMessage(`Demande marquée comme ${!demande.processed ? 'traitée' : 'non traitée'}.`);
  }
};

const archiveApplication = async (demande: Demande) => {
  const archivedDate = new Date().toISOString();
  const { error } = await supabase
    .from('applications')
    .update({ archived: true, archived_date: archivedDate })
    .eq('id', demande.id);

  if (error) {
    console.error('Erreur lors de l\'archivage :', error);
  } else {
    setDemandes((prev) => {
      const updated = prev.map((d) => 
        d.id === demande.id ? { ...d, archived: true, archived_date: archivedDate } : d
      );
      localStorage.setItem('applications', JSON.stringify(updated));
      // Mettre à jour le compteur de notifications
      const nonTraiteesCount = updated.filter(d => !d.processed && !d.archived).length;
      updateNonTraitees(nonTraiteesCount);
      return updated;
    });
    setSuccessMessage('Demande archivée avec succès.');
  }
};




  const telecharger = (demande: Demande) => {
    const contenu = Object.entries(demande)
      .filter(([key]) => key !== 'id' && key !== 'processed')
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
    const blob = new Blob([contenu], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `demande-${demande.nom}.txt`;
    link.click();
  };

  const envoyerEmail = (demande: Demande) => {
    const corps = Object.entries(demande)
      .filter(([key]) => key !== 'id' && key !== 'processed')
      .map(([key, val]) => `${key}: ${val}`)
      .join('%0D%0A');
    window.location.href = `mailto:sjovilleurbanne@gmail.com?subject=nouvelle%20demande%20d'adhesion&body=${corps}`;
  };

  const demandesActives = demandes.filter(d => !d.archived);
  const demandesArchivees = demandes.filter(d => d.archived);

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-gray-800">Demandes de jardin</h1>

      <div className="space-y-6">
        {demandesActives.length === 0 ? (
          <p className="text-neutral-500">Aucune demande active enregistrée.</p>
        ) : (
          [...demandesActives]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((demande) => (
              <div
                key={demande.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                  demande.processed ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-green-800">{demande.nom}</h2>
                  <span className="text-sm text-neutral-500">
                    {new Date(demande.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      
                    })}
                  </span>
                </div>

<div className="text-sm text-neutral-700 space-y-1 mb-4">
  <p><strong>Email :</strong> {demande.email}</p>
  <p><strong>Adresse :</strong> {demande.adresse}</p>
  <p><strong>Ville :</strong> {demande.ville || 'Non spécifiée'}</p>
  <p><strong>Téléphone portable :</strong> {demande.telephoneportable}</p>
  {demande.telephonefixe && (
    <p><strong>Téléphone fixe :</strong> {demande.telephonefixe}</p>
  )}
  <p><strong>Taille du jardin :</strong> {demande.taillejardin}</p>
  <p><strong>Expérience jardinage :</strong> {demande.experience}</p>
  <p><strong>Budget connu :</strong> {demande.budgetconnu}</p>
  <p><strong>Temps disponible :</strong> {demande.tempsdisponible}</p>
  <p><strong>Inspection mensuelle acceptée :</strong> {demande.inspectionconnu}</p>
  <p><strong>Engagement charte :</strong> {demande.engagementcharte}</p>
  <p><strong>Engagement règlement :</strong> {demande.engagementreglement}</p>
  <p><strong>Engagement lieu public (pas de manifestation religieuse) :</strong> {demande.engagementlieupublic}</p>
  <p><strong>Motivations :</strong> {demande.motivations}</p>
</div>




                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={demande.processed}
                      onChange={() => toggleProcessed(demande)}

                    />
                    {demande.processed ? 'Traitée' : 'Non traitée'}
                  </label>

                  {demande.processed && (
                    <button
                      onClick={() => archiveApplication(demande)}
                      className="text-orange-600 hover:underline font-semibold"
                    >
                      Archiver la demande
                    </button>
                  )}

                  <button
                    onClick={() => telecharger(demande)}
                    className="text-green-700 hover:underline"
                  >
                    Télécharger
                  </button>

                  <button
                    onClick={() => envoyerEmail(demande)}
                    className="text-blue-600 hover:underline"
                  >
                    Envoyer par email
                  </button>

<button
  onClick={() => {
    setDemandeASupprimer(demande);
    setShowConfirmModal(true);
  }}
  className="text-red-600 hover:underline"
>
  Supprimer
</button>

                </div>
              </div>
            ))
        )}
      </div>

      {demandesArchivees.length > 0 && (
        <div className="space-y-6 mt-12">
          <h2 className="text-2xl font-bold text-gray-600">Demandes archivées</h2>
          <div className="space-y-6">
            {[...demandesArchivees]
              .sort((a, b) => new Date(b.archived_date || b.date).getTime() - new Date(a.archived_date || a.date).getTime())
              .map((demande) => (
                <div
                  key={demande.id}
                  className="bg-gray-100 rounded-lg shadow-sm p-6 border-l-4 border-gray-400 opacity-75"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-600">{demande.nom}</h2>
                    <div className="text-sm text-gray-500">
                      <p>Demande: {new Date(demande.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}</p>
                      {demande.archived_date && (
                        <p className="font-semibold">Archivée le: {new Date(demande.archived_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p><strong>Email :</strong> {demande.email}</p>
                    <p><strong>Adresse :</strong> {demande.adresse}</p>
                    <p><strong>Ville :</strong> {demande.ville || 'Non spécifiée'}</p>
                    <p><strong>Téléphone portable :</strong> {demande.telephoneportable}</p>
                    {demande.telephonefixe && (
                      <p><strong>Téléphone fixe :</strong> {demande.telephonefixe}</p>
                    )}
                    <p><strong>Taille du jardin :</strong> {demande.taillejardin}</p>
                    <p><strong>Expérience jardinage :</strong> {demande.experience}</p>
                    <p><strong>Budget connu :</strong> {demande.budgetconnu}</p>
                    <p><strong>Temps disponible :</strong> {demande.tempsdisponible}</p>
                    <p><strong>Inspection mensuelle acceptée :</strong> {demande.inspectionconnu}</p>
                    <p><strong>Engagement charte :</strong> {demande.engagementcharte}</p>
                    <p><strong>Engagement règlement :</strong> {demande.engagementreglement}</p>
                    <p><strong>Engagement lieu public (pas de manifestation religieuse) :</strong> {demande.engagementlieupublic}</p>
                    <p><strong>Motivations :</strong> {demande.motivations}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <button
                      onClick={() => telecharger(demande)}
                      className="text-gray-600 hover:underline"
                    >
                      Télécharger
                    </button>

                    <button
                      onClick={() => envoyerEmail(demande)}
                      className="text-gray-600 hover:underline"
                    >
                      Envoyer par email
                    </button>

                    <button
                      onClick={() => {
                        setDemandeASupprimer(demande);
                        setShowConfirmModal(true);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

{successMessage && (
  <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
)}
{showConfirmModal && demandeASupprimer && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
      <h2 className="text-xl font-semibold mb-4 text-red-700">Confirmation</h2>
      <p className="mb-6">
        Es-tu sûr de vouloir supprimer la demande de <strong>{demandeASupprimer.nom}</strong> ?
        <br></br>Cette action est irréversible!
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={async () => {
            const { error } = await supabase.from('applications').delete().eq('id', demandeASupprimer.id);
            if (!error) {
              setDemandes((prev) => {
                const updated = prev.filter(d => d.id !== demandeASupprimer.id);
                localStorage.setItem('applications', JSON.stringify(updated));
                // Mettre à jour le compteur de notifications
                const nonTraiteesCount = updated.filter(d => !d.processed && !d.archived).length;
                updateNonTraitees(nonTraiteesCount);
                return updated;
              });
              setSuccessMessage(`Demande de ${demandeASupprimer.nom} supprimée avec succès.`);
            } else {
              console.error('Erreur suppression :', error.message);
            }
            setShowConfirmModal(false);
            setDemandeASupprimer(null);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Supprimer
        </button>
        <button
          onClick={() => {
            setShowConfirmModal(false);
            setDemandeASupprimer(null);
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminApplicationsPage;
