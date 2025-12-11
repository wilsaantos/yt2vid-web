import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface VideoFormat {
  quality: string;
  itag: number;
  container: string;
  filesize: string;
}

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  formats: VideoFormat[];
}

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('');

  const handleGetInfo = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
    } catch (error) {
      alert('Erro ao obter informações do vídeo');
    }
    setLoading(false);
  };

  const handleDownload = async (quality: string) => {
    if (quality === '1080p' || quality === '720p') {
      setSelectedQuality(quality);
      setShowModal(true);
      return;
    }

    setDownloading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/download?url=${encodeURIComponent(url)}&quality=${quality}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo?.title || 'video'}.mp4`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert('Erro ao fazer download');
    }
    setDownloading(false);
  };

  const handlePurchase = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/create-checkout`, {
        videoTitle: videoInfo?.title || 'Vídeo',
        videoUrl: url,
        quality: selectedQuality
      });

      window.location.href = response.data.url;
    } catch (error) {
      alert('Erro ao processar pagamento');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🎥 YT2VID</h1>
        <p>Baixe vídeos do YouTube facilmente</p>
      </header>

      <main>
        <div className="input-section">
          <input
            type="text"
            placeholder="Cole a URL do vídeo do YouTube aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={handleGetInfo} disabled={loading || !url}>
            {loading ? 'Carregando...' : 'Obter Informações'}
          </button>
        </div>

        {videoInfo && (
          <div className="video-info">
            <div className="video-preview">
              <img src={videoInfo.thumbnail} alt={videoInfo.title} />
              <div>
                <h3>{videoInfo.title}</h3>
                <p>Duração: {Math.floor(parseInt(videoInfo.duration) / 60)}:{(parseInt(videoInfo.duration) % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>

            <div className="formats">
              <h4>Escolha a qualidade:</h4>
              {videoInfo.formats.map((format) => (
                <button
                  key={format.itag}
                  onClick={() => handleDownload(format.quality)}
                  disabled={downloading}
                  className={`format-btn ${(format.quality === '1080p' || format.quality === '720p') ? 'premium' : ''}`}
                >
                  {format.quality === '1080p' ? '🔥 Máxima Qualidade (1080p)' :
                    format.quality === '720p' ? '⭐ 720p HD' :
                      `${format.quality} (${format.container})`}
                  {(format.quality === '1080p' || format.quality === '720p') &&
                    <span className="premium-badge">PREMIUM</span>
                  }
                </button>
              ))}
            </div>
          </div>
        )}



        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>

              <div className="modal-header">
                <h2>🔥 Download Premium</h2>
                <div className="discount-badge">80% OFF</div>
              </div>

              <div className="modal-content">
                <div className="price-section">
                  <div className="old-price">De R$ 9,99</div>
                  <div className="new-price">Por apenas R$ 1,99</div>
                </div>

                <div className="benefits">
                  <div className="benefit">✅ Qualidade {selectedQuality}</div>
                  <div className="benefit">✅ Download instantâneo</div>
                  <div className="benefit">✅ Sem marca d'água</div>
                  <div className="benefit">✅ Suporte prioritário</div>
                </div>

                <div className="payment-info">
                  <p>💳 Pagamento seguro via cartão</p>
                  <p>💵 Pagamento seguro via PIX</p>
                  <p>🔒 Processado pelo Stripe</p>
                </div>

                <button className="purchase-btn" onClick={handlePurchase}>
                  Comprar Agora - R$ 1,99
                </button>

                <p className="guarantee">🛡️ Compra Garantida</p>
              </div>
            </div>
          </div>
        )}
      </main>


    </div>
  );
}

export default App;