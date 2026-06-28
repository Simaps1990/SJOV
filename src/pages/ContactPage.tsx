import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useContent } from "../context/ContentContext";
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';


const ContactPage: React.FC = () => {
const { associationContent } = useContent();
const { ref: pageRef, isVisible: pageVisible } = useScrollReveal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (value.trim() && errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Ce champ est obligatoire';
    if (!formData.email.trim()) {
      newErrors.email = 'Ce champ est obligatoire';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Ce champ est obligatoire';
    if (!formData.message.trim()) newErrors.message = 'Ce champ est obligatoire';
   if (!captchaChecked) newErrors.captcha = 'Réponse incorrecte au captcha';


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await emailjs.send(
        'service_72k1rg7',
        'template_0r7ikbq',
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        },
        'ZeeOYdos-SZkow9gK'
      );
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setCaptchaChecked(false);
    } catch (error) {
      alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    }
  };

  return (
    <div className="pb-16">
      <SEO 
        title="Contact SJOV | Société des Jardins Ouvriers de Villeurbanne | Rhône-Alpes"
        description="Contactez la Société des Jardins Ouvriers de Villeurbanne (SJOV), association de bénévoles passionnés depuis 1936, pour toute question sur nos jardins partagés, nos événements de jardinage ou pour postuler à un jardin à Villeurbanne (69100) en région Rhône-Alpes."
        keywords="contact SJOV, Société des Jardins Ouvriers de Villeurbanne, jardins partagés, Villeurbanne, 69100, adresse SJOV, téléphone SJOV, email SJOV, permanence jardins, Rhône-Alpes, Lyon, Métropole de Lyon, Auvergne-Rhône-Alpes, bénévolat, coordonnées association, formulaire contact, horaires permanence, plan accès jardins, visites jardins, renseignements jardinage, demande information, adhésion association, rejoindre bénévoles, localisation jardins, siège social, bureau association, secrétariat SJOV, assistance jardinage, questions jardins, rendez-vous visite"
      />
      <div className="container-custom">
        <div
          ref={pageRef}
          className={`transition-all duration-700 ease-out ${
            pageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
        <h1 className="font-heading font-bold text-4xl mb-2">Contact</h1>
        <p className="text-neutral-600 text-lg mb-8">
          Nous sommes à votre écoute. N'hésitez pas à nous contacter pour toute question.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-heading font-semibold text-2xl mb-6">Informations de contact</h2>
              <div className="space-y-4">
                {associationContent.adresse && (
                  <div className="flex items-start">
                    <MapPin className="text-primary-500 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p className="text-neutral-600">{associationContent.adresse}</p>
                    </div>
                  </div>
                )}
                {associationContent.telephone && (
                  <div className="flex items-start">
                    <Phone className="text-primary-500 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="text-neutral-600">{associationContent.telephone}</p>
                    </div>
                  </div>
                )}
                {associationContent.email && (
                  <div className="flex items-start">
                    <Mail className="text-primary-500 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-neutral-600">{associationContent.email}</p>
                    </div>
                  </div>
                )}
                {associationContent.horaires && (
                  <div className="flex items-start">
                    <Clock className="text-primary-500 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-medium">Horaires de permanence</h3>
                      <p className="text-neutral-600">{associationContent.horaires}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {isSubmitted ? (
              <div className="bg-success-50 border border-success-200 p-6 rounded-lg">
                <h2 className="font-heading font-semibold text-xl text-success-700 mb-2">
                  Votre message a été envoyé avec succès !
                </h2>
                <p className="text-success-600 mb-4">
                  Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="btn-outline"
                >
                  Envoyer un nouveau message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-heading font-semibold text-2xl mb-6">Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Nom <span className="text-error-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'border-error-500' : ''}`}
                      />
                      {errors.name && <p className="text-error-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-error-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'border-error-500' : ''}`}
                      />
                      {errors.email && <p className="text-error-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="subject" className="form-label">
                        Sujet <span className="text-error-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`form-input ${errors.subject ? 'border-error-500' : ''}`}
                      />
                      {errors.subject && <p className="text-error-500 text-sm mt-1">{errors.subject}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="message" className="form-label">
                        Message <span className="text-error-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className={`form-input ${errors.message ? 'border-error-500' : ''}`}
                      />
                      {errors.message && <p className="text-error-500 text-sm mt-1">{errors.message}</p>}
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <label htmlFor="captchaQuestion" className="text-sm block font-medium">
  Combien font 3 + 4 ? <span className="text-error-500">*</span>
</label>
<input
  type="text"
  id="captchaQuestion"
  name="captcha"
  value={captchaChecked ? '7' : ''}
  onChange={(e) => setCaptchaChecked(e.target.value === '7')}
  className={`form-input mt-1 ${errors.captcha ? 'border-error-500' : ''}`}
/>
{errors.captcha && (
  <p className="text-error-500 text-sm mt-1">{errors.captcha}</p>
)}

                    </div>
                    {errors.captcha && (
                      <div className="md:col-span-2 text-error-500 text-sm">{errors.captcha}</div>
                    )}
                  </div>
                  <div className="mt-6">
                    <button type="submit" className="btn-primary">
                      Envoyer le message
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
