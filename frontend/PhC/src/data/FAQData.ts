
export interface FAQItem {
    id: number;
    question: string;
    answer: string;
    details: string[];
}

export const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Comment passer une commande sur mesure ?",
        answer: "Passer une commande sur mesure chez ProphCouture est une expérience simple et personnalisée. Voici comment cela fonctionne en détail :",
        details: [
            "1. Explorez nos collections ou apportez votre propre inspiration.",
            "2. Consultez notre guide des tailles ou prenez rendez-vous pour une prise de mesures.",
            "3. Sélectionnez le tissu et les finitions qui vous plaisent.",
            "4. Validez votre commande en ligne avec un acompte sécurisé.",
            "5. Suivez l'avancement de votre tenue via votre espace client.",
            "6. Essayage intermédiaire (si nécessaire) pour ajuster les détails.",
            "7. Réception de votre tenue finale sous emballage premium.",
            "8. Service après-vente inclus pour d'éventuelles retouches mineures."
        ]
    },
    {
        id: 2,
        question: "Quels sont les délais de confection ?",
        answer: "Nos délais varient selon la complexité du modèle et la charge de travail de notre atelier. Nous privilégions toujours la qualité.",
        details: [
            "Pour une tenue standard, comptez entre 7 à 10 jours ouvrables.",
            "Les créations complexes ou robes de mariée nécessitent 3 à 6 semaines.",
            "Vous pouvez opter pour le service 'Express' pour une livraison en 72h (frais supplémentaires).",
            "Le délai commence dès la validation des mesures et du tissu.",
            "Nous vous tenons informés à chaque étape par notification.",
            "Les délais de livraison (transport) s'ajoutent au temps de confection.",
            "Pendant les périodes de fêtes, nous recommandons de commander 1 mois à l'avance.",
            "Une date de livraison estimée est toujours fournie avant paiement."
        ]
    },
    {
        id: 3,
        question: "Comment prendre mes mesures correctement ?",
        answer: "Une bonne prise de mesures est essentielle pour un ajustement parfait. Nous vous accompagnons dans cette étape.",
        details: [
            "Utilisez un mètre ruban souple de couturière.",
            "Faites-vous aider par une autre personne pour plus de précision.",
            "Mesurez le tour de poitrine à l'endroit le plus fort.",
            "Le tour de taille se prend au niveau le plus fin, au-dessus du nombril.",
            "Le tour de hanches se mesure à l'endroit le plus large du bassin.",
            "Ne serrez pas le mètre ruban, laissez un doigt d'aisance.",
            "Portez des sous-vêtements similaires à ceux que vous porterez avec la tenue.",
            "En cas de doute, consultez notre guide vidéo ou réservez une session vidéo avec un styliste."
        ]
    },
    {
        id: 4,
        question: "Proposez-vous des tissus ou dois-je apporter le mien ?",
        answer: "Nous offrons une flexibilité totale concernant le choix des matériaux pour votre création.",
        details: [
            "Nous disposons d'un large catalogue de tissus premium (Coton, Soie, Lin, Bazin, Wax).",
            "Vous pouvez commander des échantillons de tissus avant de valider votre tenue.",
            "Si vous avez votre propre tissu, vous pouvez nous l'envoyer ou le déposer à l'atelier.",
            "Nous vérifions toujours la qualité de votre tissu avant la coupe.",
            "Nous conseillons sur le métrage nécessaire selon le modèle choisi.",
            "Le prix de la confection est ajusté si vous fournissez le tissu.",
            "Nous proposons aussi des tissus éco-responsables et locaux.",
            "Les chutes de tissus peuvent être récupérées ou recyclées selon votre choix."
        ]
    },
    {
        id: 5,
        question: "Quelle est votre politique de retour et de retouches ?",
        answer: "Votre satisfaction est notre priorité absolue. Nous garantissons un résultat conforme à vos attentes.",
        details: [
            "Si la tenue ne correspond pas aux mesures fournies, les retouches sont gratuites.",
            "Vous disposez de 14 jours après réception pour signaler un problème.",
            "Les retours pour 'changement d'avis' ne sont pas acceptés sur le sur-mesure.",
            "En cas de défaut de fabrication, nous remplaçons la tenue ou remboursons intégralement.",
            "Les frais de port pour retouches justifiées sont à notre charge.",
            "Une garantie 'Ajustement Parfait' est incluse dans chaque commande.",
            "Pour les articles de prêt-à-porter (non personnalisés), le retour est possible sous 30 jours.",
            "Notre service client est disponible 7j/7 pour traiter vos réclamations."
        ]
    },
    {
        id: 6,
        question: "Livrez-vous à l'international ?",
        answer: "Oui, ProphCouture habille ses clients partout dans le monde.",
        details: [
            "Nous livrons dans plus de 50 pays via nos partenaires (DHL, FedEx).",
            "Les frais de port sont calculés automatiquement lors de la commande.",
            "Les délais internationaux varient de 3 à 7 jours ouvrables selon la destination.",
            "Un numéro de suivi vous est fourni dès l'expédition.",
            "Des frais de douane peuvent s'appliquer selon la législation de votre pays.",
            "Nous soignons particulièrement l'emballage pour les longs trajets.",
            "Une assurance perte/vol est incluse pour tous les envois internationaux.",
            "Nous livrons également en point relais pour plus de flexibilité."
        ]
    }
];
