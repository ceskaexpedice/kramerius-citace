# Porovnání citací `roles=false` vs. `roles=true`

- Testováno PIDů: 105
- Úspěšně zpracováno: 105
- Chyby při načítání: 0
- Alespoň jeden změněný formát: 105
- Změny ISO 690: 86
- Změny MLA: 85
- Změny BibTeX: 102
- Změny Wiki: 105
- Změny RIS: 85

## Kategorie

| Kategorie | Celkem | Úspěšně | ISO změněno | MLA změněno | Needs review |
|---|---:|---:|---:|---:|---:|
| A_zadna_role | 18 | 18 | 11 | 13 | 13 |
| C_mixed_hodne_chybi | 14 | 14 | 14 | 14 | 14 |
| D_jen_imprint | 3 | 3 | 3 | 3 | 0 |
| E_imprint_i_autor | 8 | 8 | 7 | 7 | 1 |
| F_textova_role | 9 | 9 | 8 | 8 | 1 |
| G_duplicitni_jmena | 3 | 3 | 3 | 2 | 2 |
| H_jen_korporace | 9 | 9 | 6 | 6 | 2 |
| I_vzacna_role | 21 | 21 | 21 | 20 | 3 |
| J_mnoho_jmen | 4 | 4 | 4 | 3 | 1 |
| K_baseline_1_autor | 6 | 6 | 0 | 0 | 0 |
| K_baseline_prekladatel | 3 | 3 | 3 | 3 | 0 |
| K_baseline_vic_autoru | 4 | 4 | 3 | 3 | 3 |
| K_sbornik_editor | 3 | 3 | 3 | 3 | 1 |

## Chyby

Žádné.

## Diagnostické signály

- Citovaná jména, ale bez slotu primary/editor: 15
  - `uuid:7bc6bda0-7910-11e8-87bd-005056827e52` (C_mixed_hodne_chybi)
  - `uuid:7ddbccc0-ee62-11e4-b834-005056827e51` (C_mixed_hodne_chybi)
  - `uuid:02754c10-4179-11e8-8142-005056827e51` (E_imprint_i_autor)
  - `uuid:8565e036-3961-451e-9da2-07bf36473b24` (F_textova_role)
  - `uuid:0d0e7cf0-34bd-11ed-aab1-005056827e51` (H_jen_korporace)
  - `uuid:01ca9c80-1c7f-11e8-bdb0-005056827e51` (I_vzacna_role)
  - `uuid:020ef170-0203-11e6-845a-005056827e51` (I_vzacna_role)
  - `uuid:022d22a0-6e33-11e8-87bd-005056827e52` (I_vzacna_role)
  - `uuid:06f37500-523d-11e6-ab2f-005056827e52` (I_vzacna_role)
  - `uuid:0ce0b670-37f7-11e3-a5bb-005056827e52` (I_vzacna_role)
  - `uuid:78a62886-b2f8-415c-b130-de19877d0753` (I_vzacna_role)
  - `uuid:79f13e6f-f6c0-4f4b-b052-a9a03215f643` (I_vzacna_role)
  - `uuid:7b254400-6c66-11e2-8ed6-005056827e52` (I_vzacna_role)
  - `uuid:01c43960-1410-11e9-a9e5-005056827e52` (K_baseline_prekladatel)
  - `uuid:01d052a0-bfe6-11e3-aec3-005056827e52` (K_baseline_prekladatel)
- Záznamy s deduplikovaným jménem: 1
  - `uuid:7ddbccc0-ee62-11e4-b834-005056827e51`: Česko

## Změny ISO 690

### uuid:01a4e242-047d-421d-9d17-415ccb0faede — A_zadna_role

- `roles=false`: Výzkumný ústav rostlinné výroby. Výzkum, vývoj a aplikace nových postupů zaměřených na kontrolu a minimalizaci vlivu činitelů s negativním dopadem na zdravotní bezpečnost zemědělských surovin, produktů a potravin: průběžné poznatky řešení aktuálních projektů MZeČR : sborník příspěvků. Praha: Výzkumný ústav rostlinné výroby, 2012-9999. ISBN 978-80-7427-117-5.
- `roles=true`: Výzkum, vývoj a aplikace nových postupů zaměřených na kontrolu a minimalizaci vlivu činitelů s negativním dopadem na zdravotní bezpečnost zemědělských surovin, produktů a potravin: průběžné poznatky řešení aktuálních projektů MZeČR : sborník příspěvků. Praha: Výzkumný ústav rostlinné výroby, 2012-9999. ISBN 978-80-7427-117-5.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=2

### uuid:02fd0720-9208-11e7-a9a4-005056827e51 — A_zadna_role

- `roles=false`: Sdružení hasičů Čech, Moravy a Slezska. Požární ochrana očima dětí. 1. vyd. Praha: Professional Publishing, 2007. ISBN 978-80-86946-36-8.
- `roles=true`: Požární ochrana očima dětí. 1. vyd. Praha: Professional Publishing, 2007. ISBN 978-80-86946-36-8.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:04b5da20-077b-11ea-a20e-005056827e51 — A_zadna_role

- `roles=false`: Svaz českých knihkupců a nakladatelů. Stanovy Svazu českých knihkupců a nakladatelů, Praha: schváleny výměrem zemského úřadu v Praze, odd. 19, č. 985/6 z r. 1939, dne 14. října 1939. Praha: Svaz českých knihkupců a nakladatelů, 1939.
- `roles=true`: Stanovy Svazu českých knihkupců a nakladatelů, Praha: schváleny výměrem zemského úřadu v Praze, odd. 19, č. 985/6 z r. 1939, dne 14. října 1939. Praha: Svaz českých knihkupců a nakladatelů, 1939.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:06a9bb30-ee62-11e4-b834-005056827e51 — A_zadna_role

- `roles=false`: Úřad vlády. Interakce mezi léky při substituční léčbě opioidy: zaostřeno na buprenorfin a metadon. 1. vyd. v českém jazyce. Praha]: Národní monitorovací středisko pro drogy a drogové závislosti, 2009. ISBN 978-80-87041-69-7.
- `roles=true`: Interakce mezi léky při substituční léčbě opioidy: zaostřeno na buprenorfin a metadon. 1. vyd. v českém jazyce. Praha]: Národní monitorovací středisko pro drogy a drogové závislosti, 2009. ISBN 978-80-87041-69-7.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:081353e0-2e05-11ea-a83e-005056827e51 — A_zadna_role

- `roles=false`: Oddělení regionálních analýz a informačních služeb. Vybrané oblasti udržitelného rozvoje v Ústeckém kraji. Ústí nad Labem: Český statistický úřad, 2007. ISBN 978-80-250-1598-8.
- `roles=true`: Vybrané oblasti udržitelného rozvoje v Ústeckém kraji. Ústí nad Labem: Český statistický úřad, 2007. ISBN 978-80-250-1598-8.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:27fcb066-6423-4052-9e14-88c8874d0201 — A_zadna_role

- `roles=false`: Vysoká škola technická a ekonomická v Českých Budějovicích. application of electronic media in teaching and testing in foreign languages at the university of applied sciences: Využití elektronických médií ve výuce a testování v cizích jazycích na profesně zaměřené škole. Brno]: Tribun, 2013. ISBN 978-80-263-0358-9.
- `roles=true`: application of electronic media in teaching and testing in foreign languages at the university of applied sciences: Využití elektronických médií ve výuce a testování v cizích jazycích na profesně zaměřené škole. Brno]: Tribun, 2013. ISBN 978-80-263-0358-9.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=2

### uuid:79421ab0-7493-11e8-9690-005056827e51 — A_zadna_role

- `roles=false`: PAVEL, Josef a MOYZESOVÁ, Naďa. Velká kniha pověstí: z českých, moravských a slezských hradů a zámků. V této podobě 1. vyd. V Praze: XYZ, 2007. ISBN 978-80-86864-81-5.
- `roles=true`: PAVEL, Josef. Velká kniha pověstí: z českých, moravských a slezských hradů a zámků. V této podobě 1. vyd. V Praze: XYZ, 2007. ISBN 978-80-86864-81-5.
- Diagnostika: confidence=unknown, needsReview=true, used=1, excluded=1

### uuid:7a355c70-280f-11eb-bd18-005056827e51 — A_zadna_role

- `roles=false`: Státní úřad pro válečné poškozence (Praha). Výroční zpráva o činnosti Státního úřadu pro válečné poškozence v Praze za r. 1948. Praha: nákl. vl., 1949.
- `roles=true`: Výroční zpráva o činnosti Státního úřadu pro válečné poškozence v Praze za r. 1948. Praha: nákl. vl., 1949.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:7af0b1b0-084c-11e6-a5b6-005056827e52 — A_zadna_role

- `roles=false`: Česko. Správa daní a poplatků: Daňové poradenství : podle stavu k 12.2.2004. Ostrava: Sagit, 2004. ISBN 80-7208-409-7.
- `roles=true`: Správa daní a poplatků: Daňové poradenství : podle stavu k 12.2.2004. Ostrava: Sagit, 2004. ISBN 80-7208-409-7.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:7c1b1bc0-e0e9-11e3-b110-005056827e51 — A_zadna_role

- `roles=false`: Jednota českých matematiků a fyziků. Půlstoleté jubileum Jednoty českých mathematiků a fysiků v Praze. V Praze: Jednota českých mathematiků a fysiků, 1913.
- `roles=true`: Půlstoleté jubileum Jednoty českých mathematiků a fysiků v Praze. V Praze: Jednota českých mathematiků a fysiků, 1913.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=1

### uuid:83182010-29c5-11e4-8e0d-005056827e51 — A_zadna_role

- `roles=false`: Katedra financí a účetnictví. Finance a účetnictví v kontextu ekonomické krize: [Liberec] 12. listopadu 2009. Vyd. 1. V Liberci: Technická univerzita, 2010. ISBN 978-80-7372-564-8.
- `roles=true`: Finance a účetnictví v kontextu ekonomické krize: [Liberec] 12. listopadu 2009. Vyd. 1. V Liberci: Technická univerzita, 2010. ISBN 978-80-7372-564-8.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=2

### uuid:25503d00-6ae5-11e7-aab4-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: VORÁČ, Miloš; Moravská galerie (Brno, Česko) a Uměleckoprůmyslové muzeum (Brno, Česko). Umění restaurovat umění: práce restaurátorského oddělení Moravské galerie v Brně v letech 1996-2006 : [Moravská galerie v Brně, Uměleckoprůmyslové muzeum, Husova 14, 1.12.2006-18.3.2007. V Brně: Moravská galerie, 2006. ISBN 80-7027-159-0.
- `roles=true`: VORÁČ, Miloš (ed.). Umění restaurovat umění: práce restaurátorského oddělení Moravské galerie v Brně v letech 1996-2006 : [Moravská galerie v Brně, Uměleckoprůmyslové muzeum, Husova 14, 1.12.2006-18.3.2007. V Brně: Moravská galerie, 2006. ISBN 80-7027-159-0.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:6a0993de-9ace-4787-85ae-7cbc50327b21 — C_mixed_hodne_chybi

- `roles=false`: ONDŘEJ, Jan et al. Ekonomické a právní otázky zadlužení ekonomik, podniků a domácností: sborník mezinárodní konference : Praha, 23.11.2012. Vyd. 1. Praha: Soukromá vysoká škola ekonomických studií, 2012. ISBN 978-80-86744-93-3.
- `roles=true`: ONDŘEJ, Jan (sest.); MARKOVÁ, Lucie (sest.) a HÁLA, Milan (sest.). Ekonomické a právní otázky zadlužení ekonomik, podniků a domácností: sborník mezinárodní konference : Praha, 23.11.2012. Vyd. 1. Praha: Soukromá vysoká škola ekonomických studií, 2012. ISBN 978-80-86744-93-3.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=4

### uuid:71059380-49fa-11e4-8113-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: BOURNE, Sam; TITCHMARSH, Alan; MANKELL, Henning a HAMMOND, Diane Coplin. Konečné zúčtování. Vyd. 1. Praha: Reader's Digest Výběr, 2010. ISBN 978-80-7406-097-7.
- `roles=true`: BOURNE, Sam. Konečné zúčtování. Vyd. 1. Praha: Reader's Digest Výběr, 2010. ISBN 978-80-7406-097-7.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=3

### uuid:73b356e0-bfac-11e3-b110-005056827e51 — C_mixed_hodne_chybi

- `roles=false`: BUREŠ, Oldřich; Metropolitní univerzita Praha a Prague Security Studies Institute. Teorie a praxe postkonfliktní rekonstrukce: sborník vybraných příspěvků z konference pořádané Metropolitní univerzitou Praha ve spolupráci s Prague Security Studies Institute v Praze 22. listopadu 2008. Plzeň: Vydavatelství a nakladatelství Aleš Čeněk, 2008. ISBN 978-80-7380-142-7.
- `roles=true`: BUREŠ, Oldřich (ed.). Teorie a praxe postkonfliktní rekonstrukce: sborník vybraných příspěvků z konference pořádané Metropolitní univerzitou Praha ve spolupráci s Prague Security Studies Institute v Praze 22. listopadu 2008. Plzeň: Vydavatelství a nakladatelství Aleš Čeněk, 2008. ISBN 978-80-7380-142-7.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=3

### uuid:75ec3a20-88e9-11e3-bd09-005056827e51 — C_mixed_hodne_chybi

- `roles=false`: SKUTIL, Martin; Pedagogická fakulta a Ústav primární a preprimární edukace. Vývoj, proměny a možnosti primárního vzdělávání: sborník příspěvků k životnímu jubileu doc. PhDr. Marty Faberové, CSc. Hradec Králové: Gaudeamus, 2009. ISBN 978-80-7041-707-2.
- `roles=true`: SKUTIL, Martin (ed.). Vývoj, proměny a možnosti primárního vzdělávání: sborník příspěvků k životnímu jubileu doc. PhDr. Marty Faberové, CSc. Hradec Králové: Gaudeamus, 2009. ISBN 978-80-7041-707-2.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:7734c2b0-6534-11e6-85af-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: HOGGARD, Pavlína et al. Joseph Stein - Jerry Bock - Sheldon Harnick, Šumař na střeše: muzikál podle povídek Šoloma Alejchema : desátá inscenace šedesáté první sezóny : premiéry 6. a 7. května 2006 na Hudební scéně Městského divadla Brno. Brno: Městské divadlo Brno, 2006. ISBN 80-239-7966-3.
- `roles=true`: STEIN, Joseph. Joseph Stein - Jerry Bock - Sheldon Harnick, Šumař na střeše: muzikál podle povídek Šoloma Alejchema : desátá inscenace šedesáté první sezóny : premiéry 6. a 7. května 2006 na Hudební scéně Městského divadla Brno. Pavlína HOGGARD (ed.). Brno: Městské divadlo Brno, 2006. ISBN 80-239-7966-3.
- Diagnostika: confidence=unknown, needsReview=true, used=2, excluded=4

### uuid:7784cd60-1c7a-11e8-a0cf-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: PROCHÁZKA, Jaroslav; Česká betonářská společnost a ČBS Servis (firma). Navrhování betonových konstrukcí 1. Prvky z prostého a železového betonu : dimenzování prvků s přihlédnutím k EN 1992-1-1 : [skriptum]. 3. vyd. Praha: ČBS Servis, 2007. ISBN 978-80-903807-5-2.
- `roles=true`: PROCHÁZKA, Jaroslav. Navrhování betonových konstrukcí 1. Prvky z prostého a železového betonu : dimenzování prvků s přihlédnutím k EN 1992-1-1 : [skriptum]. 3. vyd. Praha: ČBS Servis, 2007. ISBN 978-80-903807-5-2.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:77efe060-82a9-11e3-a6e0-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: SCHMIDTOVÁ, Natalie et al. Já su stěhovavý pták =: I'm a migrating bird : Natálie Maslikova-Schmidtová (1895-1981) : [výstavy Galerie výtvarného umění v Chebu, 16. února - 17. dubna 2006, Muzeum umění Olomouc, 29. červen - 17. září 2006. Vyd. 1. Olomouc: Muzeum umění Olomouc, 2006. ISBN 80-85227-79-7.
- `roles=true`: POHRIBNÝ, Arsén. Já su stěhovavý pták =: I'm a migrating bird : Natálie Maslikova-Schmidtová (1895-1981) : [výstavy Galerie výtvarného umění v Chebu, 16. února - 17. dubna 2006, Muzeum umění Olomouc, 29. červen - 17. září 2006. Anežka ŠIMKOVÁ (ed., autor úvodu). Natalie SCHMIDTOVÁ (výtvarník). Vyd. 1. Olomouc: Muzeum umění Olomouc, 2006. ISBN 80-85227-79-7.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=2

### uuid:7814a34f-3f66-4508-9247-622cb174baed — C_mixed_hodne_chybi

- `roles=false`: CHÝLOVÁ, Hana; LUKEŠ, Martin; ŠUCHA, Matúš a Vysoká škola ekonomická v Praze. Psychologie práce a organizace v ČR: sborník z konference přináší vybrané příspěvky, které zazněly na konferenci konané ve dnech 20.-21.9.2012 na Vysoké škole ekonomické v Praze. Praha: Oeconomica, 2012. ISBN 978-80-245-1910-4.
- `roles=true`: CHÝLOVÁ, Hana (ed.); LUKEŠ, Martin (ed.) a ŠUCHA, Matúš (ed.). Psychologie práce a organizace v ČR: sborník z konference přináší vybrané příspěvky, které zazněly na konferenci konané ve dnech 20.-21.9.2012 na Vysoké škole ekonomické v Praze. Praha: Oeconomica, 2012. ISBN 978-80-245-1910-4.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=2

### uuid:7a738fd0-b021-11e3-b833-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: DOLEŽÁN, Libor et al. Slovinské drama dnes: antologie překladů současné slovinské dramatiky. V češtině vyd. 1. Brno: Větrné mlýny, c2006. ISBN 978-80-86907-54-3.
- `roles=true`: JOVANOVIĆ, Dušan. Slovinské drama dnes: antologie překladů současné slovinské dramatiky. Libor DOLEŽÁN (ed.). V češtině vyd. 1. Brno: Větrné mlýny, c2006. ISBN 978-80-86907-54-3.
- Diagnostika: confidence=unknown, needsReview=true, used=2, excluded=4

### uuid:7bc6bda0-7910-11e8-87bd-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: SVOBODA, Josef et al. Josef Svoboda - Robert Wilson: světlo - light up the lights. Praha: Museum Kampa - Nadace Jana a Medy Mládkových, [2010?]. ISBN 978-80-87344-08-8.
- `roles=true`: Josef Svoboda - Robert Wilson: světlo - light up the lights. Josef SVOBODA (výtvarník). Robert WILSON (výtvarník). Meda MLÁDKOVÁ (autor úvodu). Praha: Museum Kampa - Nadace Jana a Medy Mládkových, [2010?]. ISBN 978-80-87344-08-8.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=2

### uuid:7c69f681-9945-4cd2-af48-95ba2295e8ee — C_mixed_hodne_chybi

- `roles=false`: ROZMAHEL, Petr a Mendelova univerzita. Eurozone Future: From Crisis to Stabilization, Reform and Growth?: international conference : Mendel University in Brno, Czech Republic November 28-29, 2013. Ed. 1st. Bučovice: Martin Stříž, 2013. ISBN 978-80-87106-69-3.
- `roles=true`: ROZMAHEL, Petr (ed.). Eurozone Future: From Crisis to Stabilization, Reform and Growth?: international conference : Mendel University in Brno, Czech Republic November 28-29, 2013. Ed. 1st. Bučovice: Martin Stříž, 2013. ISBN 978-80-87106-69-3.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:7ddbccc0-ee62-11e4-b834-005056827e51 — C_mixed_hodne_chybi

- `roles=false`: HRUŠÁKOVÁ, Milana; Česko a Česko. Zákon o rodině: Zákon o registrovaném partnerství : komentář. 4. vyd. Praha: C.H. Beck, 2009. ISBN 978-80-7400-061-4.
- `roles=true`: Zákon o rodině: Zákon o registrovaném partnerství : komentář. Milana HRUŠÁKOVÁ (autor komentáře). 4. vyd. Praha: C.H. Beck, 2009. ISBN 978-80-7400-061-4.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=1

### uuid:800b9460-96e1-11e7-ab16-005056827e52 — C_mixed_hodne_chybi

- `roles=false`: VACEK, Jiří; Katedra managementu, inovací a projektů a Ministerstvo pro místní rozvoj. Moderní management ve veřejné správě. 1. vyd. Plzeň: Západočeská univerzita v Plzni, 2006. ISBN 80-7043-501-1.
- `roles=true`: VACEK, Jiří (ed.). Moderní management ve veřejné správě. 1. vyd. Plzeň: Západočeská univerzita v Plzni, 2006. ISBN 80-7043-501-1.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:07efa250-85b6-11ec-8ca2-005056827e52 — D_jen_imprint

- `roles=false`: Ministerstvo veřejných prací. Sbírka zákonů, nařízení a předpisů pro státní službu stavební v Republice československé. Díl Svazek VII., Sešit 1. Doplňky. Silniční stavby. V Praze: Státní tiskárna, 1934.
- `roles=true`: Sbírka zákonů, nařízení a předpisů pro státní službu stavební v Republice československé. Díl Svazek VII., Sešit 1. Doplňky. Silniční stavby. V Praze: Státní tiskárna, 1934.
- Diagnostika: confidence=certain, needsReview=false, used=0, excluded=1

### uuid:23a2493c-b319-4a99-bcb0-bb0df47b1367 — D_jen_imprint

- `roles=false`: Martin. Biblia Bohemica. Kutná Hora: Martin z Tišnova, 14.11.1489.
- `roles=true`: Biblia Bohemica. Kutná Hora: Martin z Tišnova, 14.11.1489.
- Diagnostika: confidence=certain, needsReview=false, used=0, excluded=1

### uuid:7319f6bd-c342-48ef-87b6-53ffcf8f8cbb — D_jen_imprint

- `roles=false`: WEIGEL, Hans. HABITVS PRAECIPVORVM POPVLORVM, TAM VIRORVM QVAM foeminarum Singulari arte depicti: Trachtenbuch: Darin fast allerley vnd der fürnembsten Nationen, die heutigs tags bekandt sein, Kleidungen, beyde wie es bey Manns vnd Weibspersonen gebreuchlich, mit allem vleiss abgerissen sein, sehr lustig vnd kurtz weilig zusehen. Nürnberg: bey Hans Weigel Formschneider, 1577.
- `roles=true`: HABITVS PRAECIPVORVM POPVLORVM, TAM VIRORVM QVAM foeminarum Singulari arte depicti: Trachtenbuch: Darin fast allerley vnd der fürnembsten Nationen, die heutigs tags bekandt sein, Kleidungen, beyde wie es bey Manns vnd Weibspersonen gebreuchlich, mit allem vleiss abgerissen sein, sehr lustig vnd kurtz weilig zusehen. Nürnberg: bey Hans Weigel Formschneider, 1577.
- Diagnostika: confidence=certain, needsReview=false, used=0, excluded=1

### uuid:00ab5250-4f39-11eb-9496-005056827e52 — E_imprint_i_autor

- `roles=false`: HLAVÁČ, Jiří a Fakulta financí a účetnictví. Fúze a akvizice: proces nákupu a prodeje firem. Vydání druhé přepracované. Praha: Vysoká škola ekonomická v Praze, Nakladatelství Oeconomica, 2016. ISBN 978-80-245-2159-6.
- `roles=true`: HLAVÁČ, Jiří. Fúze a akvizice: proces nákupu a prodeje firem. Vydání druhé přepracované. Praha: Vysoká škola ekonomická v Praze, Nakladatelství Oeconomica, 2016. ISBN 978-80-245-2159-6.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:01ce215e-12c1-4b1c-a4e9-cec8ab44b0f4 — E_imprint_i_autor

- `roles=false`: HAVELKA, Martin; KROPÁČ, Jiří a Pedagogická fakulta. Nedávná technika. 1. vydání. . ISBN 978-80-244-5193-0.
- `roles=true`: HAVELKA, Martin a KROPÁČ, Jiří. Nedávná technika. 1. vydání. . ISBN 978-80-244-5193-0.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=1

### uuid:02754c10-4179-11e8-8142-005056827e51 — E_imprint_i_autor

- `roles=false`: MAŠEK, Richard et al. Legenda o svatém Václavovi. V Praze: Bonaventura, 2008. ISBN 978-80-85197-47-1.
- `roles=true`: Legenda o svatém Václavovi. Richard MAŠEK (překl.). Karel ZEMAN (il.). Anežka VIDMANOVÁ (autor úvodu). V Praze: Bonaventura, 2008. ISBN 978-80-85197-47-1.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=7

### uuid:04cd9f87-7539-4271-8797-d61e2005461d — E_imprint_i_autor

- `roles=false`: SCOT, Michael a FIVIZZANO, Jacobus. Liber physiognomiae. [Venezia]: [Jacobus de Fivizzano], 1477.
- `roles=true`: SCOT, Michael. Liber physiognomiae. [Venezia]: [Jacobus de Fivizzano], 1477.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:06b37970-b635-11ec-b29b-005056827e52 — E_imprint_i_autor

- `roles=false`: STODOLOVÁ, Eva; KADLEC, Matěj a Tělocvičná jednota Sokol Libuš. 100 let Sokola v Libuši: 90 let sokolovny, 30 let znovuobnovení jednoty. Praha: Městská část Praha-Libuš, 2019. ISBN 978-80-270-7980-3.
- `roles=true`: STODOLOVÁ, Eva a KADLEC, Matěj. 100 let Sokola v Libuši: 90 let sokolovny, 30 let znovuobnovení jednoty. Praha: Městská část Praha-Libuš, 2019. ISBN 978-80-270-7980-3.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=1

### uuid:0a4351e0-cddd-11e7-9c14-005056827e51 — E_imprint_i_autor

- `roles=false`: GOEIJ, Hana de a Česká spořitelna. 190: Česká spořitelna 1825-2015. První vydání. Praha: pro Českou spořitelnu vydala Mladá fronta a.s, 2015. ISBN 978-80-204-3824-9.
- `roles=true`: GOEIJ, Hana de. 190: Česká spořitelna 1825-2015. První vydání. Praha: pro Českou spořitelnu vydala Mladá fronta a.s, 2015. ISBN 978-80-204-3824-9.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:0cff4a24-5af1-44ee-a42b-a07e5b46d83e — E_imprint_i_autor

- `roles=false`: TRUHLÁŘOVÁ, Zuzana a Ústav sociální práce. Metody práce se skupinou. Vydání: první. . ISBN 978-80-7435-445-8.
- `roles=true`: TRUHLÁŘOVÁ, Zuzana. Metody práce se skupinou. Vydání: první. . ISBN 978-80-7435-445-8.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:0805a1af-ebfe-4613-a868-8665147126a7 — F_textova_role

- `roles=false`: MÜLLER, Johann Carl et al. Galerie der berühmtesten Tonkünstler des 18. und 19. Jahrhunderts: Ihre kurzen Biographien, charakterisirende Anekdoten und ästhetische Darstellung ihrer Werke Díl Erster Theil. Zweiter wohlfeilere Ausg. .
- `roles=true`: Galerie der berühmtesten Tonkünstler des 18. und 19. Jahrhunderts: Ihre kurzen Biographien, charakterisirende Anekdoten und ästhetische Darstellung ihrer Werke Díl Erster Theil. Zweiter wohlfeilere Ausg. .
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=5

### uuid:23666593-ba77-444a-bcde-1d44e6a81870 — F_textova_role

- `roles=false`: VON NEUKIRCH, Michael. Harmonie der sieben vorzüglichsten Meßopfer-Theorien. Mainz: Druckerei Lehrlingshaus, 1907.
- `roles=true`: VON NEUKIRCH, Michael (sest.). Harmonie der sieben vorzüglichsten Meßopfer-Theorien. Mainz: Druckerei Lehrlingshaus, 1907.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:236769a1-df43-4add-941c-2a64cea3cc36 — F_textova_role

- `roles=false`: MARSILI, Luigi Ferdinando et al. DANUBIUS PANNONICO-MYSICUS: Observationibus GEOGRAPHICIS, ASTRONOMICIS, HYDROGRAPHICIS, HISTORICIS, PHYSICIS PERLUSTRATUS Et in sex Tomos digestus Díl TOMUS SECUNDUS. HAGAE COMITUM: APUD P. GOSSE, R. CHR. ALBERTS, P. DE HONDT, 1726.
- `roles=true`: MARSILI, Luigi Ferdinando. DANUBIUS PANNONICO-MYSICUS: Observationibus GEOGRAPHICIS, ASTRONOMICIS, HYDROGRAPHICIS, HISTORICIS, PHYSICIS PERLUSTRATUS Et in sex Tomos digestus Díl TOMUS SECUNDUS. HAGAE COMITUM: APUD P. GOSSE, R. CHR. ALBERTS, P. DE HONDT, 1726.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=5

### uuid:6c978921-83ec-43c9-bbaf-c9bf20ccef1e — F_textova_role

- `roles=false`: BLANKAART, Steven; BOUTESTEYN, Cornelis a LUCHTMANS, Jordaan. STEPH. BLANCARDI ANATOMIA REFORMATA: Sive Concinna Corporis Humani. DISSECTIO, Ad Neotericorum mentem adornata, Plurimisque tabulis chalcographicis Illustrata. Accedit ejusdem Authoris de Balsamatione, Nova Methodus, a Nemine antehac hoc modo descripta. LUGDUNI BATAVORUM: Apud Cornelium Boutesteyn, 1687.
- `roles=true`: BLANKAART, Steven. STEPH. BLANCARDI ANATOMIA REFORMATA: Sive Concinna Corporis Humani. DISSECTIO, Ad Neotericorum mentem adornata, Plurimisque tabulis chalcographicis Illustrata. Accedit ejusdem Authoris de Balsamatione, Nova Methodus, a Nemine antehac hoc modo descripta. LUGDUNI BATAVORUM: Apud Cornelium Boutesteyn, 1687.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=2

### uuid:70d31eac-8421-4cb0-97b2-0bbae46fd27c — F_textova_role

- `roles=false`: LIVIGNI, Filippo; PAISIELLO, Giovanni a KURZBÖCK, Joseph von. Frascatana: Dramma giocosoper musica: Da rappresentarsi ne'teatri privileiati di Vienna l'anno 1775. Vienna: t.G. Kurzbök, 1775.
- `roles=true`: LIVIGNI, Filippo. Frascatana: Dramma giocosoper musica: Da rappresentarsi ne'teatri privileiati di Vienna l'anno 1775. Giovanni PAISIELLO (skladatel). Vienna: t.G. Kurzbök, 1775.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=1

### uuid:7d7b2cee-bd5c-4310-a67b-4cb9a489ce21 — F_textova_role

- `roles=false`: SCHMIDT, Giovanni a ROSSINI, Gioachino. Elisabetta regina d'Inghilterra: Drama in 2 atti. Vienna: t. G.B. Wallishauser, 1822.
- `roles=true`: SCHMIDT, Giovanni. Elisabetta regina d'Inghilterra: Drama in 2 atti. Gioachino ROSSINI (skladatel). Vienna: t. G.B. Wallishauser, 1822.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:8565e036-3961-451e-9da2-07bf36473b24 — F_textova_role

- `roles=false`: RUTZ, Caspar a WIERICH, H. SACRI ROMANI IMPERI[I] ORNATVS: item GERMANORVM DIVERSARVMQ[UE] GENTIVM PECVLIARES VESTITVS. Quibus accedunt Ecclesiasticorum habitus varij. Heidelberg: Excudebat Caspar Rutz, 1588.
- `roles=true`: SACRI ROMANI IMPERI[I] ORNATVS: item GERMANORVM DIVERSARVMQ[UE] GENTIVM PECVLIARES VESTITVS. Quibus accedunt Ecclesiasticorum habitus varij. H WIERICH (výtvarník). Heidelberg: Excudebat Caspar Rutz, 1588.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:e80690c1-bf00-4a20-be52-5676e409ca56 — F_textova_role

- `roles=false`: HANTHALER, Chrysostomus. Anmuthigen und Nutz-Bringenden Bilder-Lusts: Vedoppletes Trachten-Büch, d.i. Kleidung's-Arten Beistlich und Weltlicher Versonen verschidener Völcker. Anno MDCCXLVI Díl Zehenter Band. [místo vydání není známé]: [nakladatel není známý], 1746.
- `roles=true`: HANTHALER, Chrysostomus (sest.). Anmuthigen und Nutz-Bringenden Bilder-Lusts: Vedoppletes Trachten-Büch, d.i. Kleidung's-Arten Beistlich und Weltlicher Versonen verschidener Völcker. Anno MDCCXLVI Díl Zehenter Band. [místo vydání není známé]: [nakladatel není známý], 1746.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:25e84c00-1f45-11ef-b304-5ef3fc9bb22f — G_duplicitni_jmena

- `roles=false`: MYSLIVEČEK, Jaromír; Elektrotechnická fakulta a České vysoké učení technické v Praze. Základní fyziologické principy I. Vyd. 2., přeprac. Praha: Nakladatelství ČVUT, 2007. ISBN 978-80-01-03599-3.
- `roles=true`: MYSLIVEČEK, Jaromír. Základní fyziologické principy I. Vyd. 2., přeprac. Praha: Nakladatelství ČVUT, 2007. ISBN 978-80-01-03599-3.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:7c901250-cf41-11e7-9c14-005056827e51 — G_duplicitni_jmena

- `roles=false`: JONŠTA, Petr; SILBERNAGEL, Arnošt a SILBERNAGEL, Arnošt. Zjišťování příčin havárií kovových součástí. Ostrava: Kovosil, 2007. ISBN 978-80-903694-0-5.
- `roles=true`: JONŠTA, Petr; SILBERNAGEL, Arnošt, jr a SILBERNAGEL, Arnošt. Zjišťování příčin havárií kovových součástí. Ostrava: Kovosil, 2007. ISBN 978-80-903694-0-5.
- Diagnostika: confidence=certain, needsReview=false, used=3, excluded=0

### uuid:839d31b0-1a81-11e7-96ce-005056827e51 — G_duplicitni_jmena

- `roles=false`: FIALKA, Miloslav; Technologická fakulta a Fakulta aplikované informatiky. Diferenciální počet funkcí více proměnných s aplikacemi: výklad, řešené příklady, cvičení : učební text. Vyd. 2. Ve Zlíně: UTB, 2006. ISBN 80-7318-377-3.
- `roles=true`: FIALKA, Miloslav. Diferenciální počet funkcí více proměnných s aplikacemi: výklad, řešené příklady, cvičení : učební text. Vyd. 2. Ve Zlíně: UTB, 2006. ISBN 80-7318-377-3.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=2

### uuid:0a83a538-4de1-4ea9-b2f7-19f13bc67001 — H_jen_korporace

- `roles=false`: A.W.A.L. Konference Izolace: ... ročník konference Izolace ... : šikmé střešní pláště : přednášky konference Izolace ... : ... - PVA EXPO Praha. 2014-9999. ISSN 2533-8110.
- `roles=true`: Konference Izolace: ... ročník konference Izolace ... : šikmé střešní pláště : přednášky konference Izolace ... : ... - PVA EXPO Praha. 2014-9999. ISSN 2533-8110.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=2

### uuid:0ccebf20-eab9-11ef-8de1-5ef3fc9bb22f — H_jen_korporace

- `roles=false`: Slovanský bazar (spolek) a Ústřední matice školská. Slovanský bazar: ústřední matici školské dívky české. V Praze: Nákladem Slov. bazaru, 1890.
- `roles=true`: Slovanský bazar: ústřední matici školské dívky české. V Praze: Nákladem Slov. bazaru, 1890.
- Diagnostika: confidence=certain, needsReview=true, used=0, excluded=2

### uuid:0d0e7cf0-34bd-11ed-aab1-005056827e51 — H_jen_korporace

- `roles=false`: Lingea (firma). Turecké pobřeží: inspirace na cesty. 1. vydání. V Brně: Lingea, 2016. ISBN 978-80-7508-182-7.
- `roles=true`: Turecké pobřeží: inspirace na cesty. Lingea (firma) (překl.). 1. vydání. V Brně: Lingea, 2016. ISBN 978-80-7508-182-7.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:0d2d53f4-136c-4f15-bf94-713f1c6e1683 — H_jen_korporace

- `roles=false`: Alfred A. Knopf, Inc. [Farewel party]: [výstřižky recenzí díla] : [Alfred A. Knopf]. [New York]: [Alfred A. Knopf].
- `roles=true`: [Farewel party]: [výstřižky recenzí díla] : [Alfred A. Knopf]. [New York]: [Alfred A. Knopf].
- Diagnostika: confidence=certain, needsReview=false, used=0, excluded=1

### uuid:230097d0-8ad5-11ea-a354-005056827e51 — H_jen_korporace

- `roles=false`: Nová scéna. Golden Prague: 54 : international television festival Golden Prague, September 27-30, 2017, Prague - The New Stage of the National Theatre and other places : catalogue. Praha: Česká televize, 2017. ISBN 978-80-7404-236-2.
- `roles=true`: Národní divadlo v Praze. Nová scéna (organizátor). Golden Prague: 54 : international television festival Golden Prague, September 27-30, 2017, Prague - The New Stage of the National Theatre and other places : catalogue. Praha: Česká televize, 2017. ISBN 978-80-7404-236-2.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:7d2533cc-ef76-4116-8bf4-ed3e048331bf — H_jen_korporace

- `roles=false`: Carl Hanser Verlag.  Identität]: [výstřižky recenzí díla] : [Carl Hanser Verlag]. [München]: [Carl Hanser Verlag].
- `roles=true`: Identität]: [výstřižky recenzí díla] : [Carl Hanser Verlag]. [München]: [Carl Hanser Verlag].
- Diagnostika: confidence=certain, needsReview=false, used=0, excluded=1

### uuid:00aaf7c0-fa6d-11e2-9923-005056827e52 — I_vzacna_role

- `roles=false`: BUCHHEIM, Lothar-Günther a HRBEK, Ivan. Ponorka. Praha: Naše vojsko, 1991. ISBN 80-206-0161-9.
- `roles=true`: BUCHHEIM, Lothar-Günther. Ponorka. Ivan HRBEK (autor úvodu). Praha: Naše vojsko, 1991. ISBN 80-206-0161-9.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:01ca9c80-1c7f-11e8-bdb0-005056827e51 — I_vzacna_role

- `roles=false`: FUKOVÁ, Eva. Eva Fuková: fotografie šedesátých let = photographs of the sixties. Praha]: Museum Kampa - Nadace Jana a Medy Mládkových, 2007. ISBN 978-80-239-9161-1.
- `roles=true`: Eva Fuková: fotografie šedesátých let = photographs of the sixties. Eva FUKOVÁ (výtvarník). Praha]: Museum Kampa - Nadace Jana a Medy Mládkových, 2007. ISBN 978-80-239-9161-1.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:01dce7d0-9104-11e6-baa5-005056827e51 — I_vzacna_role

- `roles=false`: BAČKORA, Štěpán. Dětské hry a zábavy. V Praze: Štěpán Bačkora, 1855.
- `roles=true`: BAČKORA, Štěpán (sest.). Dětské hry a zábavy. V Praze: Štěpán Bačkora, 1855.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:020ef170-0203-11e6-845a-005056827e51 — I_vzacna_role

- `roles=false`: DEVERELL, Christine. Druhá kniha pohádek do postýlky. 1. vyd. V Praze: Egmont ČR, 2004. ISBN 80-7186-996-1.
- `roles=true`: Druhá kniha pohádek do postýlky. Christine DEVERELL (adaptátor). 1. vyd. V Praze: Egmont ČR, 2004. ISBN 80-7186-996-1.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:022d22a0-6e33-11e8-87bd-005056827e52 — I_vzacna_role

- `roles=false`: STIBOR, Miloslav; BIELESZOVÁ, Štěpánka; Muzeum moderního umění (Olomouc, Česko) a Muzeum umění (Olomouc, Česko). Miloslav Stibor: fotografie : [Muzeum umění Olomouc, Muzeum moderního umění 12.7.-30.9.2007 : katalog. Olomouc: Muzeum umění Olomouc, 2007. ISBN 978-80-85227-92-5.
- `roles=true`: Miloslav Stibor: fotografie : [Muzeum umění Olomouc, Muzeum moderního umění 12.7.-30.9.2007 : katalog. Miloslav STIBOR (fotograf). Štěpánka BIELESZOVÁ (autor úvodu). Olomouc: Muzeum umění Olomouc, 2007. ISBN 978-80-85227-92-5.
- Diagnostika: confidence=certain, needsReview=true, used=2, excluded=2

### uuid:030bf810-c0c0-11e8-bbaa-005056827e52 — I_vzacna_role

- `roles=false`: FORMÁČKOVÁ, Marie et al. To nejlepší z filmových pohádek. Praha: XYZ, 2007. ISBN 978-80-87021-50-7.
- `roles=true`: FORMÁČKOVÁ, Marie. To nejlepší z filmových pohádek. Václav BENEŠ (fotograf). Markéta STINGLOVÁ (il.). Karel Jaromír ERBEN (autor příspěvku). Božena NĚMCOVÁ (autor příspěvku). Jeanne-Marie LEPRINCE DE BEAUMONT (autor příspěvku). Praha: XYZ, 2007. ISBN 978-80-87021-50-7.
- Diagnostika: confidence=certain, needsReview=true, used=6, excluded=0

### uuid:06f37500-523d-11e6-ab2f-005056827e52 — I_vzacna_role

- `roles=false`: VESELSKÁ, Dana. Krajky ze sbírek Židovského muzeav Praze =: Laces from the collections of the Jewish Museum in Prague. V Praze: Židovské muzeum, 2004. ISBN 80-85608-86-3.
- `roles=true`: Krajky ze sbírek Židovského muzeav Praze =: Laces from the collections of the Jewish Museum in Prague. Dana VESELSKÁ (autor doslovu). V Praze: Židovské muzeum, 2004. ISBN 80-85608-86-3.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:06fe5200-ed3b-11e2-9923-005056827e52 — I_vzacna_role

- `roles=false`: BOLZANO, Bernard a LOUŽIL, Jaromír. Exhorty. Praha: Nakladatelství Lidové noviny, 2006. ISBN 978-80-7106-827-3.
- `roles=true`: BOLZANO, Bernard. Exhorty. Jaromír LOUŽIL (sest., autor komentáře, překl.). Praha: Nakladatelství Lidové noviny, 2006. ISBN 978-80-7106-827-3.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:07a534f0-4505-11e7-b56f-005056827e52 — I_vzacna_role

- `roles=false`: ZEUCH, Martin; LUKEŠ, Jaroslav a REIMANN, Eberhard. Bionika. 1. vyd. Plzeň: Fraus, c2008. ISBN 978-80-7238-714-4.
- `roles=true`: ZEUCH, Martin. Bionika. Jaroslav LUKEŠ (spolupracovník). Eberhard REIMANN (il.). 1. vyd. Plzeň: Fraus, c2008. ISBN 978-80-7238-714-4.
- Diagnostika: confidence=certain, needsReview=false, used=3, excluded=0

### uuid:0a4bfad0-e64b-11ec-a067-005056827e52 — I_vzacna_role

- `roles=false`: MLČÁK, Leoš a Galerie města Olomouce. Leoš Mlčák: koláže a objekty. Olomouc: Galerie města Olomouce, 2018. ISBN 978-80-270-9229-1.
- `roles=true`: Galerie města Olomouce (organizátor). Leoš Mlčák: koláže a objekty. Leoš MLČÁK (výtvarník). Olomouc: Galerie města Olomouce, 2018. ISBN 978-80-270-9229-1.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:0cd70390-b772-11e4-a7a2-005056827e51 — I_vzacna_role

- `roles=false`: MICHAL, Martin a MACEK, Petr. Lesk a špína showbyznysu: otevřená zákulisní zpověď Martina Michala, manžela a manažera Heleny Vondráčkové. Vyd. 1. Brno: Jota, 2008. ISBN 978-80-7217-613-7.
- `roles=true`: MICHAL, Martin. Lesk a špína showbyznysu: otevřená zákulisní zpověď Martina Michala, manžela a manažera Heleny Vondráčkové. Petr MACEK (tazatel). Vyd. 1. Brno: Jota, 2008. ISBN 978-80-7217-613-7.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:0ce0b670-37f7-11e3-a5bb-005056827e52 — I_vzacna_role

- `roles=false`: RUML, Jan a KLUSÁKOVÁ, Jana. Jana Klusáková a Jan Ruml rozmlouvají nadoraz o tom, co bylo, je a bude. Vyd. 1. Praha: Argo, 1998. ISBN 80-7203-072-8.
- `roles=true`: Jana Klusáková a Jan Ruml rozmlouvají nadoraz o tom, co bylo, je a bude. Jan RUML (zpovídaný). Jana KLUSÁKOVÁ (tazatel). Vyd. 1. Praha: Argo, 1998. ISBN 80-7203-072-8.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:0d423460-942a-11e8-9690-005056827e51 — I_vzacna_role

- `roles=false`: NEUMANN, Stanislav Kostka a ČAPEK, Josef. Kniha lesů, vod a strání: básně 1900-1913. 3. vyd. Praha: Fr. Borový, 1938.
- `roles=true`: NEUMANN, Stanislav Kostka. Kniha lesů, vod a strání: básně 1900-1913. Josef ČAPEK (il.). 3. vyd. Praha: Fr. Borový, 1938.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:277c22e0-be87-11e9-8fdf-005056827e52 — I_vzacna_role

- `roles=false`: TŮMA, Stanislav et al. Kamenná svatba: 65 let snoubení s Jarošovci : historie 65 let existence Folklorního souboru Jarošovci ve vybraných choreografiích. Mělník: Folklorní soubor Jarošovci, 2014. ISBN 978-80-260-7193-8.
- `roles=true`: TŮMA, Stanislav; ROHLÍK, Jiří a JONÁK, Vlastimil aj. Kamenná svatba: 65 let snoubení s Jarošovci : historie 65 let existence Folklorního souboru Jarošovci ve vybraných choreografiích. Mělník: Folklorní soubor Jarošovci, 2014. ISBN 978-80-260-7193-8.
- Diagnostika: confidence=certain, needsReview=false, used=10, excluded=1

### uuid:78a62886-b2f8-415c-b130-de19877d0753 — I_vzacna_role

- `roles=false`: GOLDONI, Carlo. Fiera di Sinigaglia: Dramma Giocoso per Musica. Da Rappresentarsi Nel Teatro di Trieste L' Autuno dell' Anno MDCCLXII. Trieste: Da Francesco Matthia Winkowiz, Stamp. e Libr., 1762.
- `roles=true`: Fiera di Sinigaglia: Dramma Giocoso per Musica. Da Rappresentarsi Nel Teatro di Trieste L' Autuno dell' Anno MDCCLXII. Carlo GOLDONI (libretista). Trieste: Da Francesco Matthia Winkowiz, Stamp. e Libr., 1762.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:79f13e6f-f6c0-4f4b-b052-a9a03215f643 — I_vzacna_role

- `roles=false`: MAŘAN, Epiphanius a Klášter františkánů (Dačice, Česko). Antiphonae ex antiphonario impresso. .
- `roles=true`: Antiphonae ex antiphonario impresso. Epiphanius MAŘAN (písař). .
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=1

### uuid:7b254400-6c66-11e2-8ed6-005056827e52 — I_vzacna_role

- `roles=false`: ROSIŃSKI, Grzegorz; HAMME, Jean van a PODANÝ, Richard. Thorgal. Díl 10. Země Qaa. 1. vyd. v českém jazyce. Praha: BB art, 2004. ISBN 80-86321-60-6.
- `roles=true`: Thorgal. Díl 10. Země Qaa. Grzegorz ROSIŃSKI (il.). Jean van HAMME (scenárista). Richard PODANÝ (překl.). 1. vyd. v českém jazyce. Praha: BB art, 2004. ISBN 80-86321-60-6.
- Diagnostika: confidence=certain, needsReview=false, used=3, excluded=0

### uuid:7c740989-05b6-4b7d-b65c-598f0ddcd0cb — I_vzacna_role

- `roles=false`: BÜRMANN, Heinrich a KLEIN, Karl August. Maur. Archiv: Mit 3 Kupfertafeln und einem Musikblatte Díl Der ersten Bandes erste Hälste. Mannheim: gedruckt bey br. F. W. Cordon ; 5809, 1809.
- `roles=true`: BÜRMANN, Heinrich (ed.). Maur. Archiv: Mit 3 Kupfertafeln und einem Musikblatte Díl Der ersten Bandes erste Hälste. Karl August KLEIN (skladatel). Mannheim: gedruckt bey br. F. W. Cordon ; 5809, 1809.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:7e0f0255-c046-4bed-a7ba-ba10877473b5 — I_vzacna_role

- `roles=false`: KORDIK, Faustinus; BORONI, Antonio a Klášter františkánů (Dačice, Česko). Offertoria: Chorus II. 1701-1787.
- `roles=true`: BORONI, Antonio. Offertoria: Chorus II. Faustinus KORDIK (písař). 1701-1787.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=1

### uuid:7e54a3a0-f9f5-11e8-a5a4-005056827e52 — I_vzacna_role

- `roles=false`: CHÂTELET, Albert; GROSLIER, Bernard Philippe a KUBKOVÁ, Jana. Světové dějiny umění: malířství, sochařství, architektura, užité umění. České vyd. 2., upr., V Ottově nakl. 1. Praha: Ottovo nakladatelství v divizi Cesty, 2004. ISBN 80-7181-936-0.
- `roles=true`: CHÂTELET, Albert. Světové dějiny umění: malířství, sochařství, architektura, užité umění. Jana KUBKOVÁ (překl.). České vyd. 2., upr., V Ottově nakl. 1. Praha: Ottovo nakladatelství v divizi Cesty, 2004. ISBN 80-7181-936-0.
- Diagnostika: confidence=certain, needsReview=true, used=2, excluded=1

### uuid:81145110-20c4-11e6-8d01-005056827e52 — I_vzacna_role

- `roles=false`: MAY, Karl; VILÍMEK, Josef Richard; KOTEN, Jan a PAVLÍČEK, Tomáš. Šest feniků za exemplář? Ne! Nemožné! =: Sechs Pfennige pro Exemplar? Nein! Unmöglich! : Karl May, Josef Richard Vilímek. Vyd. 1. Praha: Památník národního písemnictví, 2013. ISBN 978-80-87376-05-8.
- `roles=true`: KOTEN, Jan (ed.) a PAVLÍČEK, Tomáš (ed.). Šest feniků za exemplář? Ne! Nemožné! =: Sechs Pfennige pro Exemplar? Nein! Unmöglich! : Karl May, Josef Richard Vilímek. Vyd. 1. Praha: Památník národního písemnictví, 2013. ISBN 978-80-87376-05-8.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=2

### uuid:04535ab0-e64b-11ec-a067-005056827e52 — J_mnoho_jmen

- `roles=false`: CHRPOVÁ, Jana et al. Illusion: odrůda pšenice s komplexní rezistencí k chorobám : certifikovaná metodika. První vydání. Praha: Výzkumný ústav rostlinné výroby, v.v.i., 2020. ISBN 978-80-7427-339-1.
- `roles=true`: CHRPOVÁ, Jana; DUMALASOVÁ, Veronika a PALICOVÁ, Jana aj. Illusion: odrůda pšenice s komplexní rezistencí k chorobám : certifikovaná metodika. První vydání. Praha: Výzkumný ústav rostlinné výroby, v.v.i., 2020. ISBN 978-80-7427-339-1.
- Diagnostika: confidence=certain, needsReview=false, used=8, excluded=0

### uuid:0729ce10-88e7-11e3-bd09-005056827e51 — J_mnoho_jmen

- `roles=false`: MAN, Jiří et al. Životnost materiálů a konstrukcí 2006: sborník semináře : Brno 21.3.2006. Vyd. 1. Brno: Ústav fyziky materiálů AV ČR, 2006. ISBN 80-239-6751-7.
- `roles=true`: MAN, Jiří (ed.); PETRENEC, Martin (ed.) a POLÁK, Jaroslav (ed.). Životnost materiálů a konstrukcí 2006: sborník semináře : Brno 21.3.2006. Vyd. 1. Brno: Ústav fyziky materiálů AV ČR, 2006. ISBN 80-239-6751-7.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=3

### uuid:7d89aed3-b595-4c2a-bf02-69ec35bf73d7 — J_mnoho_jmen

- `roles=false`: SYNEK, Svatopluk et al. 6. celostátní studentská konference optometrie a ortoptiky s mezinárodní účastí: dne 15.10.2015 v prostorách posluchárny P31 Fakulty sociálních studií MU Brno : sborník přednášek. . ISBN 978-80-7013-578-5.
- `roles=true`: SYNEK, Svatopluk (ed.); PETROVÁ, Sylvie (ed.) a VESELÝ, Petr (ed.) aj. 6. celostátní studentská konference optometrie a ortoptiky s mezinárodní účastí: dne 15.10.2015 v prostorách posluchárny P31 Fakulty sociálních studií MU Brno : sborník přednášek. . ISBN 978-80-7013-578-5.
- Diagnostika: confidence=certain, needsReview=false, used=7, excluded=1

### uuid:8104fa40-65e6-11e7-b92d-005056827e51 — J_mnoho_jmen

- `roles=false`: PIAF, Edith et al. Kolo štěstí. 2. vyd. v českém jazyce. Praha: BB/art, 2010. ISBN 978-80-7381-788-6.
- `roles=true`: PIAF, Edith. Kolo štěstí. Marc ROBINE (autor úvodu). Jean COCTEAU (autor úvodu). Fred MELLA (autor doslovu). Galina KAVANOVÁ (překl.). Jiří DĚDEČEK (překl.). 2. vyd. v českém jazyce. Praha: BB/art, 2010. ISBN 978-80-7381-788-6.
- Diagnostika: confidence=certain, needsReview=false, used=6, excluded=0

### uuid:01c43960-1410-11e9-a9e5-005056827e52 — K_baseline_prekladatel

- `roles=false`: NOVÝ, Lukáš; PUNGE PUCHALSKÁ, Barbora a MÍKA, Tomáš. Joseph Anton: vzpomínky. Vyd. 1. Praha: Paseka, 2012. ISBN 978-80-7432-230-3.
- `roles=true`: Joseph Anton: vzpomínky. Lukáš NOVÝ (překl.). Barbora PUNGE PUCHALSKÁ (překl.). Tomáš MÍKA (překl.). Vyd. 1. Praha: Paseka, 2012. ISBN 978-80-7432-230-3.
- Diagnostika: confidence=certain, needsReview=false, used=3, excluded=0

### uuid:01d052a0-bfe6-11e3-aec3-005056827e52 — K_baseline_prekladatel

- `roles=false`: NEŠKUDLA, Bořek a ŽYTEK, Jakub. Kronika. Vyd. 1. Praha: Argo, 2008. ISBN 978-80-257-0088-4.
- `roles=true`: Kronika. Bořek NEŠKUDLA (překl.). Jakub ŽYTEK (překl.). Vyd. 1. Praha: Argo, 2008. ISBN 978-80-257-0088-4.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:01e4d800-fa06-11e4-8936-005056827e51 — K_baseline_prekladatel

- `roles=false`: MACDONALD, James Ramsay a HOSTINSKÁ, Zdeňka. Socialism a vláda. 1923.
- `roles=true`: MACDONALD, James Ramsay. Socialism a vláda. Zdeňka HOSTINSKÁ (překl.). 1923.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

### uuid:00a60ed0-50cd-11e7-b03f-005056827e52 — K_baseline_vic_autoru

- `roles=false`: SUCHÁČEK, Jan a Katedra regionální a environmentální ekonomiky. Na cestě k nové identitě: Ostrava, Katovice a Košice po roce 1989. 1. vyd. Ostrava: VŠB - Technická univerzita Ostrava, katedra regionální a environmentální ekonomiky, 2010. ISBN 978-80-248-2212-9.
- `roles=true`: SUCHÁČEK, Jan. Na cestě k nové identitě: Ostrava, Katovice a Košice po roce 1989. 1. vyd. Ostrava: VŠB - Technická univerzita Ostrava, katedra regionální a environmentální ekonomiky, 2010. ISBN 978-80-248-2212-9.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=1

### uuid:01e996e0-554c-11e6-ab2f-005056827e52 — K_baseline_vic_autoru

- `roles=false`: HRUŠKA, František a Institut informačních technologií. Technické prostředky automatizace II: (úvod, popis funkce, konstrukce a aplikací). Vyd. 1. Zlín: Univerzita Tomáše Bati ve Zlíně, 2005. ISBN 80-7318-259-9.
- `roles=true`: HRUŠKA, František. Technické prostředky automatizace II: (úvod, popis funkce, konstrukce a aplikací). Vyd. 1. Zlín: Univerzita Tomáše Bati ve Zlíně, 2005. ISBN 80-7318-259-9.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=1

### uuid:02141570-1847-11ef-aef8-5ef3fc9bb22f — K_baseline_vic_autoru

- `roles=false`: RABIŠKOVÁ, Miloslava; CHALUPOVÁ, Zuzana; MASTEIKOVÁ, Ruta a Ústav technologie léků. Lékové formy a biofarmacie. Díl I. Kapalné a polotuhé léky. Vyd. 1. Brno: Veterinární a farmaceutická univerzita, 2005. ISBN 80-7305-541-4.
- `roles=true`: RABIŠKOVÁ, Miloslava; CHALUPOVÁ, Zuzana a MASTEIKOVÁ, Ruta. Lékové formy a biofarmacie. Díl I. Kapalné a polotuhé léky. Vyd. 1. Brno: Veterinární a farmaceutická univerzita, 2005. ISBN 80-7305-541-4.
- Diagnostika: confidence=certain, needsReview=true, used=3, excluded=1

### uuid:0250aee0-dc73-11e5-a3e0-005056827e51 — K_sbornik_editor

- `roles=false`: MENŠÍKOVÁ, Jana a Vojenská policie. Vojenská policie =: Military Police. 1. vyd. Praha: Ministerstvo obrany České republiky - odbor prezentační a produkční VHÚ Praha, 2014. ISBN 978-80-7278-638-1.
- `roles=true`: MENŠÍKOVÁ, Jana (ed.). Vojenská policie =: Military Police. 1. vyd. Praha: Ministerstvo obrany České republiky - odbor prezentační a produkční VHÚ Praha, 2014. ISBN 978-80-7278-638-1.
- Diagnostika: confidence=certain, needsReview=true, used=1, excluded=1

### uuid:025f8440-4d77-11e6-ab2f-005056827e52 — K_sbornik_editor

- `roles=false`: COUFALÍK, Jaromír. Compendium of projects for agriculture: Leonardo da Vinci programme : prepared and published with the support of European commission (DG education and culture) on the occasion of the European valorisation seminar "Agriculture - training - Europe". Prague: National Training Fund, 2005. ISBN 80-86728-13-7.
- `roles=true`: COUFALÍK, Jaromír (ed.). Compendium of projects for agriculture: Leonardo da Vinci programme : prepared and published with the support of European commission (DG education and culture) on the occasion of the European valorisation seminar "Agriculture - training - Europe". Prague: National Training Fund, 2005. ISBN 80-86728-13-7.
- Diagnostika: confidence=certain, needsReview=false, used=1, excluded=0

### uuid:02859760-a00c-11e6-9325-005056827e52 — K_sbornik_editor

- `roles=false`: LORENCOVÁ, Radmila a SPEIRS, Jennifer. Reflection of man. Praha: Ermat, c2007. ISBN 978-80-903086-8-8.
- `roles=true`: LORENCOVÁ, Radmila (ed.) a SPEIRS, Jennifer (ed.). Reflection of man. Praha: Ermat, c2007. ISBN 978-80-903086-8-8.
- Diagnostika: confidence=certain, needsReview=false, used=2, excluded=0

