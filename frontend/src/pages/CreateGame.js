import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GameEditor from '../components/GameEditor';
import { useLanguage } from '../i18n';
import api from '../services/api';

export default function CreateGame() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSave = async (gameData) => {
    await api.createGame(gameData);
    navigate('/games');
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('createGame')}</h1>
      </div>

      <GameEditor
        onSave={handleSave}
        onCancel={() => navigate('/games')}
        saveButtonText={t('createGame')}
      />
    </Layout>
  );
}
