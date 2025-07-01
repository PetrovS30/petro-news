import './main.scss';
import PageMainContent from './pageMainContent/PageMainContent';
import PopularNews from './popularNews/PopularNews';
import LatestSportNews from './lastSportNews/LastSportNews';

const Main = () => {
    return (
        <main className='page-main'>
                <PageMainContent/>
            <aside className='sidebar'>
                    <PopularNews/>
                    <LatestSportNews/>
            </aside>
        </main>
    )
}

export default Main;

