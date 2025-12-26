export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  imagesannexes: string[]; // Tableau de strings sans null/undefined
  date: string; // date de publication
  author: string;
  created_at?: string; // rendu facultatif si jamais absent dans certaines lignes
}




export interface Event {
  id: string;
  title: string;
  content: string;
  image: string | null;
  imagesannexes: (string | null)[];
  date: string;
  author: string;
  created_at: string;
  isPast?: boolean;

  location?: string;
  description?: string;

  // ✅ Ajout nécessaire :
  start?: string;
  enddate?: string;
}






export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface FormData {
  [key: string]: string | string[] | boolean;
}

export interface GardenApplication {
  id: string;
  name: string;
  address: string;
  contact: {
    email: string;
    phone: string;
  };
  gardenSize: 'small' | 'medium' | 'large';
  experience: boolean;
  additionalInfo: Record<string, string>;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type Annonce = {
  id: string;
  nom: string;
  email?: string;
  telephone: string;
  type: 'recherche' | 'vend' | 'donne' | 'échange';
  contenu: string;
  photo1?: string;
  photo2?: string;
  statut: 'en_attente' | 'validé' | 'refusé';
  created_at?: string;
};

export type SecteurParcelle = 'siege' | 'clos_jacquet' | 'digue_sud' | 'digue_nord' | 'nord';

export interface Parcelle {
  id: string;
  numero_parcelle: number | null;
  surface_m2: number | null;
  secteur: SecteurParcelle | null;
  created_at?: string;
}

export interface Jardinier {
  id: string;
  nom: string | null;
  numero_parcelle: number | null;
  email: string | null;
  telephone: string | null;
  annee_naissance: number | null;
  statut: 'actif' | 'retraite' | null;
  created_at?: string;
}
