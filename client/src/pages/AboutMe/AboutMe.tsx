import './aboutMe.scss';

const AboutMe = () => {
    return (
        <div className="resume-container">
            <header className="resume-header">
                <h1>Сергей Петров</h1>
                <p className="resume-tagline">
                    Full-Stack Developer, специалист по созданию эффективных и масштабируемых веб-приложений
                </p>
                <div className="contact-info">
                    <p><strong>Email:</strong> sergey.petrov@example.com</p>
                    <p><strong>Телефон:</strong> +7 (XXX) XXX-XX-XX</p>
                    <p><strong>LinkedIn:</strong> linkedin.com/in/sergey-petrov</p>
                    <p><strong>GitHub:</strong> github.com/sergey-petrov</p>
                </div>
            </header>

            <section className="resume-section summary">
                <h2>Обо мне</h2>
                <p>
                    Опытный и мотивированный Full-Stack разработчик с более чем 5 годами опыта в создании
                    и поддержке веб-приложений. Обладаю глубокими знаниями в **JavaScript, React, Node.js**
                    и сопутствующих технологиях. Способен эффективно работать как с клиентской, так и с серверной
                    частью, обеспечивая высокую производительность и удобство использования.
                    Увлечен чистым кодом, современными практиками разработки и постоянным обучением.
                </p>
            </section>

            <section className="resume-section skills">
                <h2>Навыки</h2>
                <div className="skills-category">
                    <h3>Фронтенд</h3>
                    <ul>
                        <li>**Языки:** JavaScript (ES6+), TypeScript</li>
                        <li>**Фреймворки/Библиотеки:** React.js, Redux, React Router, Next.js</li>
                        <li>**Разметка/Стили:** HTML5, CSS3, SASS/SCSS, Less, Styled Components, Bootstrap, Material-UI</li>
                        <li>**Инструменты:** Webpack, Babel, Vite, npm, yarn</li>
                    </ul>
                </div>
                <div className="skills-category">
                    <h3>Бэкенд</h3>
                    <ul>
                        <li>**Языки:** Node.js</li>
                        <li>**Фреймворки:** Express.js, NestJS</li>
                        <li>**Базы данных:** MongoDB, PostgreSQL, MySQL</li>
                        <li>**ORM/ODM:** Mongoose, Sequelize, TypeORM</li>
                        <li>**API:** RESTful APIs, GraphQL</li>
                    </ul>
                </div>
                <div className="skills-category">
                    <h3>Общие навыки и инструменты</h3>
                    <ul>
                        <li>**Контроль версий:** Git, GitHub, GitLab</li>
                        <li>**Методологии:** Agile, Scrum</li>
                        <li>**Облачные платформы:** (Например: AWS, Heroku, Vercel)</li>
                        <li>**Тестирование:** Jest, React Testing Library, Mocha, Chai</li>
                        <li>**CI/CD:** (Например: Jenkins, GitHub Actions)</li>
                    </ul>
                </div>
            </section>

            <section className="resume-section experience">
                <h2>Опыт работы</h2>
                <div className="job-item">
                    <h3>Full-Stack Разработчик | Tech Solutions Inc.</h3>
                    <p className="job-date">Март 2022 – Настоящее время</p>
                    <ul>
                        <li>Разработка и поддержка высоконагруженного B2B SaaS-приложения с использованием React, Node.js и MongoDB.</li>
                        <li>Реализация новых функций, включая систему отчетов и модуль аналитики, что повысило вовлеченность пользователей на 15%.</li>
                        <li>Оптимизация производительности фронтенда и бэкенда, сокращение времени загрузки страниц на 20%.</li>
                        <li>Участие в код-ревью и mentorship для младших разработчиков.</li>
                    </ul>
                </div>
                <div className="job-item">
                    <h3>Фронтенд-разработчик | Web Innovations Ltd.</h3>
                    <p className="job-date">Июнь 2019 – Февраль 2022</p>
                    <ul>
                        <li>Разработка пользовательских интерфейсов для e-commerce платформы с использованием React и Redux.</li>
                        <li>Интеграция сторонних API для платежных систем и логистики.</li>
                        <li>Написание модульных и интеграционных тестов для обеспечения стабильности кода.</li>
                        <li>Сотрудничество с дизайнерами и бэкенд-командами для реализации новых функциональных требований.</li>
                    </ul>
                </div>
            </section>

            <section className="resume-section education">
                <h2>Образование</h2>
                <div className="education-item">
                    <h3>Магистр компьютерных наук | Московский Государственный Университет</h3>
                    <p className="education-date">Сентябрь 2017 – Июнь 2019</p>
                    <p>Специализация: Программная инженерия</p>
                </div>
                <div className="education-item">
                    <h3>Бакалавр прикладной математики и информатики | Московский Авиационный Институт</h3>
                    <p className="education-date">Сентябрь 2013 – Июнь 2017</p>
                </div>
            </section>

            <section className="resume-section projects">
                <h2>Проекты</h2>
                <div className="project-item">
                    <h3>E-commerce платформа "ShopHub" (Личный проект)</h3>
                    <p>Полнофункциональная платформа для онлайн-торговли с админ-панелью. Фронтенд: React, Redux; Бэкенд: Node.js, Express, MongoDB.</p>
                    <p><a href="https://github.com/sergey-PETROV/shophub" target="_blank" rel="noopener noreferrer">GitHub Link</a></p>
                </div>
                <div className="project-item">
                    <h3>Task Tracker App (Учебный проект)</h3>
                    <p>Приложение для управления задачами с функциями создания, редактирования и отслеживания прогресса. React (Hooks), Node.js, PostgreSQL.</p>
                    <p><a href="https://github.com/sergey-PETROV/task-tracker" target="_blank" rel="noopener noreferrer">GitHub Link</a></p>
                </div>
            </section>
        </div>
    )
};

export default AboutMe;