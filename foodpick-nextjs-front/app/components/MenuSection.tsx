import styles from '../../styles/MenuSection.module.css';

type MenuItem = {
  name: string;
  price: number;
  image: string | null;
};

type Props = {
  items: MenuItem[];
}

export default function MenuSection({ items }: Props) {
  return (
    <section className={styles.menuSection}>
      <h2 className={styles.heading}>메뉴</h2>
      {items.map((item, idx) => (
        <div className={styles.menuCard} key={idx}>
          <div className={styles.menuInfo}>
            <p className={styles.menuName}>{item.name}</p>
            <p className={styles.menuPrice}>{item.price.toLocaleString()}원</p>
          </div>
          {/* 이미지가 있는 경우에만 렌더링 */}
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className={styles.menuImage}
            />
          )}
        </div>
      ))}
    </section>
  )
}