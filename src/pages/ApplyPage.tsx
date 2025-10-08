import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNotifications } from '../context/NotificationsContext';
import SEO from '../components/SEO';

const ApplyPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    telephoneportable: '',
    telephonefixe: '',
    email: '',
    taillejardin: '',
    experience: '',
    budgetconnu: '',
    tempsdisponible: '',
    inspectionconnu: '',
    engagementcharte: '',
    engagementreglement: '',
    engagementlieupublic: '',
    motivations: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateNonTraitees } = useNotifications();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ quand l'utilisateur modifie sa valeur
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation téléphone portable (format français)
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
    if (!formData.telephoneportable) {
      newErrors.telephoneportable = 'Le téléphone portable est obligatoire';
    } else if (!phoneRegex.test(formData.telephoneportable.replace(/[\s.-]/g, ''))) {
      newErrors.telephoneportable = 'Format de téléphone invalide (ex: 0612345678)';
    }

    // Validation téléphone fixe (optionnel mais si rempli doit être valide)
    if (formData.telephonefixe && !phoneRegex.test(formData.telephonefixe.replace(/[\s.-]/g, ''))) {
      newErrors.telephonefixe = 'Format de téléphone invalide (ex: 0412345678)';
    }

    // Validation champs obligatoires
    const champsObligatoires = [
      { name: 'nom', label: 'Le nom et prénom' },
      { name: 'adresse', label: 'L\'adresse' },
      { name: 'ville', label: 'La ville' },
      { name: 'taillejardin', label: 'La taille du jardin' },
      { name: 'experience', label: 'L\'expérience de jardinage' },
      { name: 'budgetconnu', label: 'La connaissance du budget' },
      { name: 'tempsdisponible', label: 'Le temps disponible' },
      { name: 'inspectionconnu', label: 'La connaissance des inspections' },
      { name: 'engagementcharte', label: 'L\'engagement à la charte' },
      { name: 'engagementreglement', label: 'L\'engagement au règlement' },
      { name: 'engagementlieupublic', label: 'L\'engagement lieu public' },
      { name: 'motivations', label: 'Les motivations' },
    ];

    for (const champ of champsObligatoires) {
      const valeur = formData[champ.name as keyof typeof formData];
      if (!valeur || valeur.trim() === '') {
        newErrors[champ.name] = `${champ.label} est obligatoire`;
      }
    }

    setErrors(newErrors);

    // Scroll vers le premier champ en erreur
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    const { error } = await supabase.from('applications').insert([
      {
        ...formData,
        processed: false,
      },
    ]);

    if (error) {
      console.error("Erreur lors de l'envoi vers Supabase :", error.message);
      alert("Une erreur s'est produite. Merci de réessayer.");
      return;
    }

    // Récupérer le nombre actuel de demandes non traitées depuis Supabase
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('processed', false);

    // Mettre à jour le compteur de notifications
    updateNonTraitees(data?.length || 0);

    setSubmitted(true);

    setFormData({
      nom: '',
      adresse: '',
      ville: '',
      telephoneportable: '',
      telephonefixe: '',
      email: '',
      taillejardin: '',
      experience: '',
      budgetconnu: '',
      tempsdisponible: '',
      inspectionconnu: '',
      engagementcharte: '',
      engagementreglement: '',
      engagementlieupublic: '',
      motivations: '',
    });
  };

  if (submitted) {
    return (
      <>
        <SEO 
          title="Postuler pour un Jardin SJOV | Jardins Partagés à Villeurbanne | Rhône-Alpes"
          description="Postulez pour obtenir un jardin partagé à la SJOV (Société des Jardins Ouvriers de Villeurbanne), association de bénévoles passionnés depuis 1936. Formulaire de demande pour cultiver votre propre parcelle dans nos jardins familiaux à Villeurbanne (69100) en région Rhône-Alpes."
          keywords="postuler jardin, demande jardin partagé, SJOV, Société des Jardins Ouvriers de Villeurbanne, jardins familiaux, Villeurbanne, 69100, parcelle jardinage, candidature jardin, Rhône-Alpes, Lyon, Métropole de Lyon, Auvergne-Rhône-Alpes, bénévolat, demande adhésion, formulaire candidature, obtenir parcelle, jardins ouvriers, devenir jardinier, attribution jardin, liste attente jardin, jardins collectifs, jardins urbains, cultiver potager, jardinage écologique, jardinage urbain, jardinage familial, parcelle cultivable, terrain jardinage, conditions attribution, engagement associatif, charte jardinier, règlement intérieur"
        />
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mb-10">
          <h1 className="text-2xl font-semibold text-green-800 mb-4">Demande envoyée</h1>
          <p>Merci pour votre candidature. Nous vous contacterons prochainement.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Postuler pour un Jardin à Villeurbanne et Vaulx-en-Velin | SJOV | Association de Bénévoles"
        description="Devenez membre de notre association de bénévoles et obtenez un jardin partagé à Villeurbanne ou Vaulx-en-Velin. La SJOV vous accompagne depuis 1936 dans votre projet de jardinage urbain en Rhône-Alpes."
        keywords="postuler jardin Villeurbanne, jardin partagé Vaulx-en-Velin, association bénévole jardinage, SJOV, Société des Jardins Ouvriers, 69100, parcelle jardinage, candidature jardin, Rhône-Alpes, Lyon, bénévolat, jardins familiaux, jardins collectifs, jardins urbains"
      />
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mb-10">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">Postuler pour un jardin</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {inputField({ label: "Nom et prénom", name: "nom", value: formData.nom, onChange: handleChange, required: true, error: errors.nom })}
          {inputField({ label: "Adresse complète", name: "adresse", value: formData.adresse, onChange: handleChange, required: true, error: errors.adresse })}
          {selectField({
            label: "Ville",
            name: "ville",
            value: formData.ville,
            onChange: handleChange,
            error: errors.ville,
            options: [
              ["", "-- Sélectionnez --"],
              ["Vaulx-en-velin", "Vaulx-en-velin"],
              ["Villeurbanne", "Villeurbanne"],
              ["autre", "Autre"]
            ]
          })}
          {inputField({ label: "Téléphone portable", name: "telephoneportable", value: formData.telephoneportable, onChange: handleChange, type: "tel", required: true, error: errors.telephoneportable })}
          {inputField({ label: "Téléphone fixe", name: "telephonefixe", value: formData.telephonefixe, onChange: handleChange, type: "tel", error: errors.telephonefixe })}
          {inputField({ label: "Email", name: "email", value: formData.email, onChange: handleChange, type: "email", required: true, error: errors.email })}

          {selectField({
            label: "Taille du jardin souhaité",
            name: "taillejardin",
            value: formData.taillejardin,
            onChange: handleChange,
            error: errors.taillejardin,
            options: [
              ["", "-- Sélectionnez --"],
              ["petite", "Jardin de petite taille (inférieure à 150 m²)"],
              ["moyenne", "Jardin de taille moyenne (entre 150 et 200 m²)"],
              ["grande", "Jardin de grande taille (supérieure à 200 m²)"],
            ]
          })}

          {selectOuiNon({ label: "Avez vous déjà une expérience de jardinage (autre que terrasse et balcon) ?", name: "experience", value: formData.experience, onChange: handleChange, error: errors.experience })}
          {selectOuiNon({ label: "Postuler pour un jardin nécessite un budget de départ d'environ 25O euros sans compter la reprise d'un cabanon de 300 euros maximum (si la parcelle en est dotée) le saviez-vous ?", name: "budgetconnu", value: formData.budgetconnu, onChange: handleChange, error: errors.budgetconnu })}

          {selectField({
            label: "De combien de temps disposez-vous pour jardiner ",
            name: "tempsdisponible",
            value: formData.tempsdisponible,
            onChange: handleChange,
            error: errors.tempsdisponible,
            options: [
              ["", "-- Sélectionnez --"],
              ["1h", "1 heure par jour"],
              ["2h", "Supérieur à 2 H par jour"],
              ["weekend", "Uniquement le week-end"],
              ["illimite", "Illimité"]
            ]
          })}

          {selectOuiNon({ label: "Savez-vous que les jardins sont inspectés tous les mois, si votre jardin n'est pas entretenu vous recevrez deux avertissements  avant d'être exclu ? Vous ne pourrez pas prétendre à récupérer la somme laissée pour votre cabanon.", name: "inspectionconnu", value: formData.inspectionconnu, onChange: handleChange, error: errors.inspectionconnu })}
          {selectOuiNon({ label: "Vous engagez-vous lors de la prise d'un jardin à signer la charte de l'association pour le respect de l'environnement (sol, ressource en eau et la biodiversité ) .", name: "engagementcharte", value: formData.engagementcharte, onChange: handleChange, error: errors.engagementcharte })}
          {selectOuiNon({ label: "Vous engagez-vous lors de la prise d'un jardin à signer le règlement intérieur contenant entre autres le respect de la tranquillité.  ", name: "engagementreglement", value: formData.engagementreglement, onChange: handleChange, error: errors.engagementreglement })}
          {selectOuiNon({ label: "Vous engagez-vous à respecter le fait que le jardin est lieux public où toute manifestation religieuse (prière) est interdite ?", name: "engagementlieupublic", value: formData.engagementlieupublic, onChange: handleChange, error: errors.engagementlieupublic })}

          <div>
            <label className="block font-medium text-gray-700 mb-1">En quelques mots quelles sont vos motivations pour obtenir un jardin *</label>
            <textarea
              name="motivations"
              value={formData.motivations}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded ${errors.motivations ? 'border-red-500 border-2' : 'border-gray-300'}`}
            />
            {errors.motivations && <p className="text-red-500 text-sm mt-1">{errors.motivations}</p>}
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Envoyer la demande
          </button>
        </form>
      </div>
    </>
  );
};

export default ApplyPage;

// Composants helpers

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  type?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  error?: string;
};

const inputField = ({ label, name, value, onChange, type = 'text', required, error }: InputFieldProps) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded ${error ? 'border-red-500 border-2' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  options: [string, string][];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string;
};

const selectField = ({ label, name, value, options, onChange, error }: SelectFieldProps) => {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label} *</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border px-3 py-2 rounded ${error ? 'border-red-500 border-2' : 'border-gray-300'}`}
      >
        {options.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

const selectOuiNon = ({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string;
}) => {
  return selectField({
    label,
    name,
    value,
    onChange,
    error,
    options: [
      ['', '-- Sélectionnez --'],
      ['oui', 'Oui'],
      ['non', 'Non'],
    ],
  });
};
