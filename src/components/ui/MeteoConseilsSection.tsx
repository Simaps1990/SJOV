import React from 'react';
import WeatherWidget from './WeatherWidget';
import { Carrot, Leaf } from 'lucide-react';

const getTempColor = (temp: number): string => {
  if (temp <= 10) return 'text-blue-600';
  if (temp <= 20) return 'text-green-600';
  if (temp <= 27) return 'text-yellow-600';
  return 'text-red-600';
};

const MONTHLY_PLANTING: Record<string, { name: string; link?: string }[]> = {
  Janvier: [
    { name: 'Betterave', link: 'https://youtu.be/VZpcjA9RQFw' },
    { name: 'Carotte', link: 'https://youtu.be/-a5_mTCV8O8' },
    { name: 'Poireau', link: 'https://youtu.be/uPe-by7x5us' },
    { name: 'Chou-fleur', link: 'https://youtu.be/q_FyPyqITxQ' },
    { name: 'Navet', link: 'https://youtu.be/HSpvVSEqh4k' }
  ],
  Février: [
    { name: 'Céleri', link: 'https://youtu.be/ZRh9NHKBjOc' },
    { name: 'Chou', link: 'https://youtu.be/wClY4CN2OY4' },
    { name: 'Oignon', link: 'https://youtu.be/SQQ5JBgAgik' },
    { name: 'Épinard', link: 'https://youtu.be/g1QH_jb-yTU' },
    { name: 'Laitue', link: 'https://youtu.be/QeZ9u1d4Snw' }
  ],
  Mars: [
    { name: 'Asperge', link: 'https://youtu.be/FyTAOI6atiI' },
    { name: 'Laitue', link: 'https://youtu.be/QeZ9u1d4Snw' },
    { name: 'Radis', link: 'https://youtu.be/4sF422O9cvw' },
    { name: 'Chou-fleur', link: 'https://youtu.be/q_FyPyqITxQ' },
    { name: 'Carotte', link: 'https://youtu.be/-a5_mTCV8O8' },
    { name: 'Poireau', link: 'https://youtu.be/uPe-by7x5us' }
  ],
  Avril: [
    { name: 'Petit pois', link: 'https://youtu.be/l7bSOZl8G0o' },
    { name: 'Navet', link: 'https://youtu.be/HSpvVSEqh4k' },
    { name: 'Épinard', link: 'https://youtu.be/g1QH_jb-yTU' },
    { name: 'Oignon', link: 'https://youtu.be/SQQ5JBgAgik' },
    { name: 'Laitue', link: 'https://youtu.be/QeZ9u1d4Snw' },
    { name: 'Radis', link: 'https://youtu.be/4sF422O9cvw' }
  ],
  Mai: [
    { name: 'Tomate', link: 'https://youtu.be/_MOMnBl5uwE' },
    { name: 'Courgette', link: 'https://youtu.be/MuFOH6Rtm1Y' },
    { name: 'Aubergine', link: 'https://youtu.be/QPpNSeOnuro' },
    { name: 'Concombre', link: 'https://youtu.be/6kiJw_hwb4I' },
    { name: 'Fève', link: 'https://youtu.be/1MAdGyuFao8' },
    { name: 'Carotte', link: 'https://youtu.be/-a5_mTCV8O8' }
  ],
  Juin: [
    { name: 'Poivron', link: 'https://youtu.be/1vJ0TlTEsHY' },
    { name: 'Haricot vert', link: 'https://youtu.be/uGSYtNrpUic' },
    { name: 'Laitue', link: 'https://youtu.be/QeZ9u1d4Snw' },
    { name: 'Épinard', link: 'https://youtu.be/g1QH_jb-yTU' },
    { name: 'Courgette', link: 'https://youtu.be/MuFOH6Rtm1Y' },
    { name: 'Artichaut', link: 'https://youtu.be/0q3UY_CMR-w' }
  ],
  Juillet: [
    { name: 'Maïs', link: 'https://youtu.be/maLNUn_wM_U?si=jd-7z3nvhXlGMmJH' },
    { name: 'Navet', link: 'https://youtu.be/v5I7YnOHm54?si=Q5nnkc8jKYktwbXy' },
    { name: 'Oignon', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Radis', link: 'https://youtu.be/LvqYvGfhKmM?si=mSdt3TTpWm6EditG' },
    { name: 'Blette', link: 'https://youtu.be/LaVBWFXkqtI?si=vVNlVHZHkoiZSOmx' },
    { name: 'Haricot vert', link: 'https://youtu.be/DZ2dn9QawWg?si=dOuSyaaJb6x7I--z' }
  ],
  Août: [
    { name: 'Chou', link: 'https://youtu.be/q_FyPyqITxQ?si=7CkdqH5KxEoWrbpY' },
    { name: 'Poireau', link: 'https://youtu.be/OXmTi38XKnc?si=4My16ZjDVvALr7J2' },
    { name: 'Concombre', link: 'https://youtu.be/6kiJw_hwb4I?si=MsmdHhstDMvrAqE0' },
    { name: 'Courgette', link: 'https://youtu.be/MuFOH6Rtm1Y?si=sgAzlh4YcYSVjqR4' },
    { name: 'Tomate', link: 'https://youtu.be/vLDHtC6zZmw?si=bDm-49nB6t8VFuGP' },
    { name: 'Laitue', link: 'https://youtu.be/QeZ9u1d4Snw?si=U5mtFwFVs2l7_hIT' }
  ],
  Septembre: [
    { name: 'Chou-fleur', link: 'https://youtu.be/By_hwI8mg94?si=-tY-NtshbIwF1ic7' },
    { name: 'Navet', link: 'https://youtu.be/v5I7YnOHm54?si=Q5nnkc8jKYktwbXy' },
    { name: 'Radis', link: 'https://youtu.be/LvqYvGfhKmM?si=mSdt3TTpWm6EditG' },
    { name: 'Carotte', link: 'https://youtu.be/qJ5yvOmGQuI?si=Gyhc-5BcMHpiVXYn' },
    { name: 'Épinard', link: 'https://youtu.be/g1QH_jb-yTU?si=TPctxZIQkAsULG-D' },
    { name: 'Céleri', link: 'https://youtu.be/jesIKZpY9vM?si=0lhhKcnk6XOLxZfz' }
  ],
  Octobre: [
    { name: 'Chou', link: 'https://youtu.be/q_FyPyqITxQ?si=7CkdqH5KxEoWrbpY' },
    { name: 'Poireau', link: 'https://youtu.be/OXmTi38XKnc?si=4My16ZjDVvALr7J2' },
    { name: 'Carotte', link: 'https://youtu.be/qJ5yvOmGQuI?si=Gyhc-5BcMHpiVXYn' },
    { name: 'Mâche', link: 'https://youtu.be/Xd6oM_dywHk?si=xaGWi0zCU0B6IxOg' },
    { name: 'Oignon', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Courge', link: 'https://youtu.be/MuFOH6Rtm1Y?si=sgAzlh4YcYSVjqR4' }
  ],
  Novembre: [
    { name: 'Fève', link: 'https://youtu.be/1MAdGyuFao8?si=TPctxZIQkAsULG-D' },
    { name: 'Pois', link: 'https://youtu.be/l7bSOZl8G0o?si=TPctxZIQkAsULG-D' },
    { name: 'Ail', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Oignon', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Échalote', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Laitue', link: 'https://youtu.be/QeZ9u1d4Snw?si=U5mtFwFVs2l7_hIT' }
  ],
  Décembre: [
    { name: 'Ail', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Échalote', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Oignon blanc', link: 'https://youtu.be/VlIDD9EN8mk?si=LH4PpcaYOgiZh4Ct' },
    { name: 'Repos du jardin', link: 'https://youtu.be/_3E_V0iHZUQ?si=4ZzwVMWLkLXx0dhd' },
    { name: 'Préparer le sol', link: 'https://youtu.be/DoAXrbao2dA?si=WDMl5RyVgc2W-Wwg' },
    { name: 'Paillage', link: 'https://youtu.be/lmQI137mVWw?si=JGSCiBohCND8SJ8r' }
  ]
};

const MeteoConseilsSection: React.FC = () => {
  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' });
  const monthKey = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
  const plantingList = MONTHLY_PLANTING[monthKey] || [];

  return (
<section className="py-0 m-0">
      <div className="container-custom">
<div className="grid md:grid-cols-2 gap-8 mt-0 mb-0">

          {/* Plantation */}
          <div className="bg-white/80 p-6 shadow-md rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Carrot className="text-green-600 h-5 w-5" />
              <h2 className="text-xl font-bold leading-tight mb-0">Ce mois-ci on plante</h2>
            </div>
            <p className="mb-4 text-sm text-neutral-600">
              {monthKey} est idéal pour ces plantations :
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-neutral-700 list-disc list-inside">
              {plantingList.map((item, idx) => (
                <li key={idx}>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-green-700"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Météo */}
          <div className="bg-white/80 p-6 shadow-md rounded-2xl backdrop-blur-sm">
<WeatherWidget
  renderTips={({ weatherCode, temperature, city, icon, airQuality, allergyRisks }) => {
    let conseilMeteo = '';
    let conseilTemp = '';

    if ([0].includes(weatherCode)) conseilMeteo = 'fait un temps clair : pensez à arroser en soirée.';
    else if ([1, 2, 3].includes(weatherCode)) conseilMeteo = 'fait un temps nuageux : conditions idéales pour semer.';
    else if ([45, 48].includes(weatherCode)) conseilMeteo = 'y a du brouillard : évitez les traitements.';
    else if ([51, 53, 55, 61, 63, 65].includes(weatherCode)) conseilMeteo = 'pleut : ne semez pas aujourd’hui.';
    else if ([71, 73, 75].includes(weatherCode)) conseilMeteo = 'neige : protégez vos plantes.';
    else if ([95, 96, 99].includes(weatherCode)) conseilMeteo = 'y a un orage : rentrez vos outils.';
    else conseilMeteo = 'y a des conditions normales : observez votre sol.';

    if (temperature >= 28) conseilTemp = 'pensez à pailler et arroser tôt le matin.';
    else if (temperature >= 20) conseilTemp = 'arrosez de préférence le matin.';
    else if (temperature <= 10) conseilTemp = 'attention au froid, couvrez les semis.';
    else conseilTemp = 'continuez l’entretien habituel.';

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-sky-500 h-5 w-5" />
            <h2 className="text-xl font-bold leading-tight mb-0">Météo actuelle</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{icon}</span>
            <span>{temperature}°C</span>
            <span className="mx-1 text-neutral-400">|</span>
            <span className="text-green-500">{city}</span>
          </div>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm text-neutral-800">
          <li>Actuellement il {conseilMeteo}</li>
<li>
  Avec une température extérieure de{' '}
  <span className={`${getTempColor(temperature)}`}>{temperature}°C</span>, {conseilTemp}
</li>
          <li>Qualité de l’air : <span className="text-green-600">{airQuality}</span></li>
<li className="text-sm text-neutral-800 list-disc list-inside">
  <span className="text-neutral-800">Risques allergènes : </span>

{allergyRisks.map((risk, idx) => (
  <span
    key={idx}
    className={`${
      risk.toLowerCase().includes('rien de préoccupant') ? 'text-green-600' :
      risk.includes('très élevé') ? 'text-red-600' :
      'text-orange-500'
    }${idx < allergyRisks.length - 1 ? ' mr-2' : ''}`}
  >
    {risk}
  </span>
))}


</li>






        </ul>
      </>
    );
  }}
/>



          </div>

        </div>
      </div>
    </section>
  );
};

export default MeteoConseilsSection;
