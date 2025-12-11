import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Success() {
  const [downloading, setDownloading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const videoUrl = urlParams.get('url');
    const quality = urlParams.get('quality');

    if (sessionId) {
      verifyAndDownload(sessionId, videoUrl, quality);
    }
  }, []);

  const verifyAndDownload = async (sessionId: string, videoUrl: string | null, quality: string | null) => {
    try {
      setDownloading(true);
      
      // Verificar pagamento
      const verification = await axios.get(`${API_URL}/api/verify-payment?session_id=${sessionId}`);
      
      if (verification.data.paid && videoUrl && quality) {
        setVerified(true);
        
        // Fazer download premium
        const response = await axios.get(
          `${API_URL}/api/download-premium?url=${encodeURIComponent(videoUrl)}&quality=${quality}&session_id=${sessionId}`,
          { responseType: 'blob' }
        );

        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${verification.data.metadata.video_title}_HD.mp4`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      alert('Erro ao processar download');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🎉 Pagamento Confirmado!</h1>
      </header>

      <main>
        <div className="success-content">
          {downloading && (
            <div className="downloading">
              <h2>⏳ Preparando seu download premium...</h2>
              <p>Aguarde enquanto processamos seu vídeo em alta qualidade.</p>
            </div>
          )}

          {verified && !downloading && (
            <div className="success">
              <h2>✅ Download Iniciado!</h2>
              <p>Seu vídeo em alta qualidade está sendo baixado.</p>
              <p>Obrigado pela sua compra!</p>
            </div>
          )}

          <div className="back-home">
            <button onClick={() => window.location.href = '/'}>
              Voltar ao Início
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Success;