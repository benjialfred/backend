export interface CoutureProfile {
    fit: string;
    gender: 'Homme' | 'Femme' | 'Enfant' | '';
    globalSize: string;
    morphology: string;
    measurementsMethod: 'auto' | 'photo' | 'visio' | 'atelier' | null;
    lengthAdjustment: string;
    collarType: string;
    shoulderType: string;
}

export const defaultCoutureProfile: CoutureProfile = {
    fit: 'Sur-mesure Premium',
    gender: '',
    globalSize: '',
    morphology: '',
    measurementsMethod: null,
    lengthAdjustment: 'Standard',
    collarType: 'Classique',
    shoulderType: 'Standard'
};
