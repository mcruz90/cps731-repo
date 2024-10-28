import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import './Home.css';

export default function Home() {
  return (
    <Layout>
      <div className="main">
        <div className="main__container">
          <div className="main__content">
            <h1>Serenity Yoga</h1>
            <p>See what makes us different</p>
            <Link to="/schedule" className="main__btn">
              Find out more
            </Link>
          </div>
          <div className="main_img--container">
            <img 
              src="/images/yogapic1.svg" 
              alt="Yoga pose illustration" 
              id="main__img"
            />
          </div>
        </div>
      </div>

      <div className="services">
        <h1>Recovery Driven</h1>
        <div className="services__container">
          <div className="services__card">
            <h2>Experience Bliss</h2>
            <p>Find out more about what we do</p>
            <Link to="/about" className="services__btn">
              Find out more
            </Link>
          </div>
          <div className="services__card">
            <h2>Cultivate Community</h2>
            <p>Schedule a group class today</p>
            <Link to="/schedule" className="services__btn">
              Find out more
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}