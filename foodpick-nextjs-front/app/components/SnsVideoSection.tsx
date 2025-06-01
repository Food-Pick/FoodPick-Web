'use client';

import styles from '../../styles/home.module.css';
import { Video } from '../types/video';

interface Props {
  videoList: Video[];
}

export default function SnsVideoSection({ videoList }: Props) {
  return (
    <section className={styles.recommendSection}>
      <h2 className={styles.sectionTitle}>🔥 SNS 인기 맛집 영상</h2>
      <div className={styles.scrollWrapper}>
        <div className={styles.videoScroll}>
          {videoList.map((video) => (
            <a 
              key={video.id} 
              href={video.url} 
              target="_blank"
              rel='noreferrer'
              className={styles.videoCard}
            >
              <img src={video.thumbnail} alt={video.title}/>
              <div className={styles.playOverlay}>▶</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}