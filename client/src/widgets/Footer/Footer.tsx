import { Link } from 'react-router-dom';

import petroLogo from '../../assets/images/petro-news-logo.svg';
import facebook from '../../assets/icons/facebook.svg';
import vk from '../../assets/icons/vk.svg';
import instagram from '../../assets/icons/instagram.svg';


import './footer.scss';

const Footer = () => {
    return (
        <footer className='footer'>
            <div className='footer-contant'>
                <div className="footer-logo">
                    <a href="/" aria-label="Вернуться на главную">
                        <img src={petroLogo} alt="petroLogo"/>
                    </a>
                </div>

                <nav className="footer-nav">
                    <ul>
                        <li><Link to='/about' className="about-link">About me</Link></li>
                    </ul>
                </nav>

                <div className="footer__social-links">
                    <div className="footer__social-link-facebook">
                        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <img src={facebook} alt="Иконка Facebook"/>
                        </a>
                    </div>
                    <div className='footer__social-link-vk'>
                        <a href="https://vk.com" target="_blank" rel="noopener noreferrer" aria-label="vk">
                            <img src={vk} alt="Иконка Twitter"/>
                        </a>
                    </div>
                    <div className='footer__social-link-instagram'>
                        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <img src={instagram} alt="Иконка Instagram"/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;