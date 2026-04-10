import styles from '../../info.module.css';

export default function EditorialBoardPage() {
  const associateEditors = [
    "Faiyaz HM Vaid (University of Karachi, Pakistan)",
    "Nousheen Mushtaq (University of Karachi, Karachi, Pakistan)"
  ];

  const boardMembers = [
    "Abdel-Aziz El-Basyouni M. Wahbi (University of Alexandria, Egypt)",
    "Afshan Siddiq (University of Karachi, Karachi, Pakistan)",
    "Anwarul Hassan Gilani (Pakistan Council for Science and Technology, Pakistan)",
    "Asia Naz (University of Karachi, Pakistan)",
    "Biswadeep Das (Chennai Med. College Hosp. & Res. Center, India)",
    "Eduardo José Caldeira (Faculty of Medicine of Jundiaí, Brazil)",
    "Farrukh Rafiq Ahmed (University of Karachi, Karachi, Pakistan)",
    "Fatih Demirci (Anadolu Universitesi Tepebasi Eskisehir Turkiye)",
    "Fawkeya Abd Allah Abbas (Zagazig University, Zagazig, Egypt)",
    "Fouzia Hassan (University of Karachi, Pakistan)",
    "Ghazala H. Rizwani (Hamdard University, Karachi, Pakistan)",
    "Hamid Merchant (University of East London, United Kingdom)",
    "Hitoshi Tanaka (Meijo University, Nagoya, Japan)",
    "Ileana Cornelia Farcasanu (Bucharest University, Romania)",
    "Iqbal Azhar (University of Karachi, Karachi, Pakistan)",
    "Jamshed Ali Kazmi (Jinnah Medical & Dental College, Pakistan)",
    "Joachim W Herzig (Johannes Gutenberg University, Germany)",
    "Judit Hohmann (Universitiy of Szeged, Hungary)",
    "Khursheed Hasan Hashmi (Ziauddin University, Pakistan)",
    "M Shaiq Ali (University of Karachi, Karachi, Pakistan)",
    "M. Izham Mohamed Ibrahim (Qatar University, Doha, Qatar)",
    "Maged Saad Abdel-Kader (University of Alexandria, Egypt)",
    "Manoranjan Adak (Nat. Medical College & Teaching Hospital, Nepal)",
    "Mansoor Ahmad (University of Karachi, Karachi, Pakistan)",
    "Mehdi Mahmoodi Salehabad (Faculty of Medicine, Rafsanjan, Iran)",
    "Meherzia MOKNI (Faculty of Sciences of Tunis, Tunisia)",
    "Michel Bourin (Nantes, France)",
    "Mohammad Amjad Kamal (King Abdulaziz University, Saudi Arabia)",
    "Mohammad Jamshed Ahmad Siddiqui (IIUM, Malaysia)",
    "Muhammad Mohtasheemul Hasan (University of Karachi, Pakistan)",
    "Muhammad Umair Khan (Aston University, United Kingdom)",
    "Naoharu Watanabe (Shizuoka University, Japan)",
    "Phei Er, Saw (Sun Yat-sen University Guangzhou, China)",
    "Rabia Ismail Yousuf (University of Karachi, Pakistan)",
    "Rahila Ikram (Barrett Hodgson University, Pakistan)",
    "S M Farid Hasan (University of Karachi, Karachi, Pakistan)",
    "S. Sohail Hasan (University of Karachi, Pakistan)",
    "S. Waseemuddin Ahmed (Benazir Bhutto Shaheed University, Pakistan)",
    "Safila Naveed (University of Karachi, Pakistan)",
    "Salman Ahmed (University of Karachi, Karachi, Pakistan)",
    "Sana Sarfaraz (University of Karachi, Karachi, Pakistan)",
    "Shah Ali-UL-Qader (University of Karachi, Karachi, Pakistan)",
    "Shamim Akhter (University of Karachi, Pakistan)",
    "Shazia Qasim Jamshed (International Medical University, Malaysia)",
    "Syed Shahzad Hasan (University of Huddersfield, United Kingdom)",
    "Tom Boudewijn Vree (Nijmegen, The Netherlands)",
    "Tong-Shui Zhou (Fudan University, Shanghai, China)",
    "Zafar Alam Mahmood (Colorcon Limited, England)",
    "Zafar Saied Saify (University of Karachi, Karachi, Pakistan)",
    "Zaheer Ul-Haq (ICCBS, University of Karachi)",
    "Zaheer-Ud-Din Babar (Qatar University, Doha)"
  ];

  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Editorial Board</h1>
        <p className={styles.subtitle}>Our distinguished board members from around the globe, committed to clinical and pharmaceutical excellence.</p>
      </header>

      <div className={styles.content}>
        <section>
          <h2>Patron</h2>
          <p><strong>Khalid M. Iraqi</strong> (University of Karachi, Pakistan)</p>
        </section>

        <section>
          <h2>Editor-in-Chief</h2>
          <p><strong>Muhammad Harris Shoaib</strong> (University of Karachi, Pakistan)</p>
        </section>

        <section>
          <h2>Associate Editors</h2>
          <ul>
            {associateEditors.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Editorial Board Members</h2>
          <ul>
            {boardMembers.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
