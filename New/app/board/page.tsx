import styles from './board.module.css';

const BOARD_MEMBERS = {
  patron: {
    name: "Prof. Dr. Khalid M. Iraqi",
    designation: "Vice Chancellor",
    affiliation: "University of Karachi, Karachi, Pakistan"
  },
  editorInChief: {
    name: "Prof. Dr. Muhammad Harris Shoaib",
    designation: "Editor-in-Chief",
    affiliation: "Faculty of Pharmacy & Pharmaceutical Sciences, University of Karachi"
  },
  associateEditors: [
    { name: "Prof. Dr. Faiyaz HM Vaid", affiliation: "University of Karachi, Pakistan" },
    { name: "Prof. Dr. Nousheen Mushtaq", affiliation: "University of Karachi, Pakistan" }
  ],
  advisoryBoard: [
    { name: "Prof. Dr. Abdel-Aziz El-Basyouni M. Wahbi", affiliation: "University of Alexandria, Egypt" },
    { name: "Dr. Hamid Merchant", affiliation: "University of East London, UK" },
    { name: "Prof. Dr. Hitoshi Tanaka", affiliation: "Meijo University, Japan" },
    { name: "Prof. Dr. Eduardo José Caldeira", affiliation: "Faculty of Medicine of Jundiaí, Brazil" },
    { name: "Prof. Dr. Zafar Saied Saify", affiliation: "University of Karachi, Pakistan" },
    { name: "Prof. Dr. Mansoor Ahmad", affiliation: "University of Karachi, Pakistan" }
  ]
};

export default function BoardPage() {
  return (
    <div className={`container section-padding ${styles.board}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Editorial Board</h1>
        <p className={styles.subtitle}>Our distinguished board members are experts in their respective fields of pharmaceutical sciences.</p>
      </div>

      <div className={styles.primaryBoard}>
        <div className={styles.boardCard}>
          <div className={styles.role}>Patron</div>
          <h2 className={styles.memberName}>{BOARD_MEMBERS.patron.name}</h2>
          <p className={styles.memberAffiliation}>{BOARD_MEMBERS.patron.designation}</p>
          <p className={styles.memberAffiliation}>{BOARD_MEMBERS.patron.affiliation}</p>
        </div>

        <div className={styles.boardCard}>
          <div className={styles.role}>Editor-in-Chief</div>
          <h2 className={styles.memberName}>{BOARD_MEMBERS.editorInChief.name}</h2>
          <p className={styles.memberAffiliation}>{BOARD_MEMBERS.editorInChief.affiliation}</p>
        </div>
      </div>

      <div className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>Associate Editors</h3>
        <div className={styles.memberGrid}>
          {BOARD_MEMBERS.associateEditors.map((member, i) => (
            <div key={i} className={styles.memberItem}>
              <div className={styles.memberItemName}>{member.name}</div>
              <div className={styles.memberItemAff}>{member.affiliation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>International Advisory Board</h3>
        <div className={styles.memberGrid}>
          {BOARD_MEMBERS.advisoryBoard.map((member, i) => (
            <div key={i} className={styles.memberItem}>
              <div className={styles.memberItemName}>{member.name}</div>
              <div className={styles.memberItemAff}>{member.affiliation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
