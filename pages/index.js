import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <h1>OMDIAN</h1>
          <p>Memuat konten...</p>
        </div>
      </div>
    );
  }

  // Landing page untuk user yang belum login
  if (!user) {
    return (
      <div className="landing-page">
        <div className="landing-container">
          <header className="landing-header">
            <h1 className="landing-title">OMDIAN</h1>
            <p className="landing-subtitle">
              Pengembangan Kompetensi Diupdate Rutinan Pegawai BPS Kabupaten Kudus
            </p>
          </header>

          <main className="landing-main">
            <div className="landing-content">
              <h2>Selamat Datang di Sistem OMDIAN</h2>
              <p>
                Sistem informasi untuk mengelola dan melacak pengembangan kompetensi 
                pegawai BPS Kabupaten Kudus secara rutin dan terstruktur.
              </p>
              
              <div className="landing-actions">
                <Link href="/login" className="btn btn-primary">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-secondary">
                  Daftar
                </Link>
              </div>
            </div>
            
            <div className="landing-features">
              <div className="feature-card">
                <h3>📊 Manajemen Data</h3>
                <p>Kelola data pelatihan dan pengembangan kompetensi dengan mudah</p>
              </div>
              <div className="feature-card">
                <h3>📈 Laporan & Statistik</h3>
                <p>Analisis progress dan pencapaian pengembangan kompetensi</p>
              </div>
              <div className="feature-card">
                <h3>👥 Multi-User</h3>
                <p>Sistem mendukung admin dan pegawai dengan hak akses berbeda</p>
              </div>
            </div>
          </main>

          <footer className="landing-footer">
            <p>&copy; 2024 BPS Kabupaten Kudus. Semua hak dilindungi.</p>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}
