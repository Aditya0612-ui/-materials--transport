// src/components/common/LanguageSwitcher.jsx
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', languageCode);
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="outline-light" 
        id="language-dropdown"
        className="d-flex align-items-center border-0 bg-transparent text-dark"
        style={{ 
          boxShadow: 'none',
          fontSize: '0.9rem',
          padding: '0.375rem 0.75rem'
        }}
      >
        <span className="me-2" style={{ fontSize: '1.1rem' }}>
          {currentLanguage.flag}
        </span>
        <span className="d-none d-md-inline">
          {currentLanguage.name}
        </span>
        <i className="bx bx-chevron-down ms-1"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow-sm border-0"
        style={{ 
          minWidth: '150px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {languages.map((language) => (
          <Dropdown.Item
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`d-flex align-items-center py-2 ${
              i18n.language === language.code ? 'active bg-success text-white' : ''
            }`}
            style={{
              borderRadius: '4px',
              margin: '2px 4px',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="me-3" style={{ fontSize: '1.1rem' }}>
              {language.flag}
            </span>
            <span style={{ fontSize: '0.9rem' }}>
              {language.name}
            </span>
            {i18n.language === language.code && (
              <i className="bx bx-check ms-auto text-white"></i>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
