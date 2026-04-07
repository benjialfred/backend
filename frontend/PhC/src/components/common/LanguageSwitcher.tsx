import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex bg-white/10 p-1 rounded-full border border-white/20">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full transition-all ${
          i18n.language.startsWith('fr')
            ? 'bg-primary-500 text-white shadow-md'
            : 'text-gray-600 hover:text-black hover:bg-white/50'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full transition-all ${
          i18n.language.startsWith('en')
            ? 'bg-primary-500 text-white shadow-md'
            : 'text-gray-600 hover:text-black hover:bg-white/50'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
