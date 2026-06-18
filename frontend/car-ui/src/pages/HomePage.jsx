import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="home-page mx-auto max-w-[1380px] px-4 py-5">
      <section className="hero-section hero-section--image flex min-h-[80vh] overflow-hidden rounded-[30px] border">
        <div className="hero-overlay grid w-full grid-cols-1 gap-10 px-8 py-10 md:px-12 md:py-12 xl:grid-cols-2 xl:items-center xl:px-14 xl:py-14">
          <div className="relative z-10">
            <span className="hero-badge">
              Yapay Zeka Destekli Araç Fiyat Tahmini ve Öneri Sistemi
            </span>

            <h1 className="hero-title mt-5">
              Aracının değerini
              <span className="hero-title-accent"> hızlı ve doğru </span>
              şekilde öğren
            </h1>

            <p className="hero-desc mt-5">
              Marka, seri, model ve diğer araç özelliklerini girerek saniyeler
              içinde fiyat tahmini alabilirsiniz.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/predict" className="ui-btn-primary hero-cta-btn">
                Tahmine Başla
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="hero-mini-pill">Hızlı sonuç</span>
              <span className="hero-mini-pill">Akıllı öneri</span>
              <span className="hero-mini-pill">Modern arayüz</span>
            </div>
          </div>

          <div className="hero-visual hero-visual--photo">
            <div className="hero-car-photo" />
          </div>
        </div>
      </section>
    </div>
  );
}