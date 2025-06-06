export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
imagesannexes?: string[];
  date: string;
  author: string;
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

export interface Annonce {
  id: string;
  nom: string;
  email?: string;
  phone: string;
  choix: 'RECHERCHE' | 'VEND' | 'DONNE' | 'ECHANGE';
  message?: string;
  contenu?: string; // ✅ garder pour compat compatibilité
  type?: string;    // ✅ idem
  photo1?: string;
  photo2?: string;
  statut: 'en_attente' | 'validé' | 'rejeté'; // ✅
  isValidated: boolean;
  date: string;
  created_at?: string; // ✅ utilisé dans le tri
}

