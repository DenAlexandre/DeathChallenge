--
-- PostgreSQL database dump
--

-- Dumped from database version 16.14
-- Dumped by pg_dump version 17.0

-- Started on 2026-07-02 23:20:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 227 (class 1255 OID 16414)
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: dc_user
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$;


ALTER FUNCTION public.update_updated_at() OWNER TO dc_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16473)
-- Name: alivePerson; Type: TABLE; Schema: public; Owner: dc_user
--

CREATE TABLE public."alivePerson" (
    id integer NOT NULL,
    nom character varying(150),
    prenom character varying(150),
    categorie character varying(150),
    annee_naissance integer,
    nationalite character varying(100),
    a_verifier text,
    statut character varying(20) DEFAULT 'validee'::character varying,
    created_by integer,
    date_naissance date,
    CONSTRAINT aliveperson_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'decedee'::character varying])::text[])))
);


ALTER TABLE public."alivePerson" OWNER TO dc_user;

--
-- TOC entry 221 (class 1259 OID 16472)
-- Name: alivePerson_id_seq; Type: SEQUENCE; Schema: public; Owner: dc_user
--

CREATE SEQUENCE public."alivePerson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."alivePerson_id_seq" OWNER TO dc_user;

--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 221
-- Name: alivePerson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dc_user
--

ALTER SEQUENCE public."alivePerson_id_seq" OWNED BY public."alivePerson".id;


--
-- TOC entry 218 (class 1259 OID 16428)
-- Name: deathPerson; Type: TABLE; Schema: public; Owner: dc_user
--

CREATE TABLE public."deathPerson" (
    id integer NOT NULL,
    nom character varying(150),
    prenom character varying(150),
    categorie character varying(150),
    date_naissance date,
    date_deces date,
    nationalite character varying(100),
    a_verifier text,
    statut character varying(20) DEFAULT 'validee'::character varying,
    created_by integer,
    alive_person_id integer,
    CONSTRAINT deathperson_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying])::text[])))
);


ALTER TABLE public."deathPerson" OWNER TO dc_user;

--
-- TOC entry 217 (class 1259 OID 16427)
-- Name: deathPerson_id_seq; Type: SEQUENCE; Schema: public; Owner: dc_user
--

CREATE SEQUENCE public."deathPerson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."deathPerson_id_seq" OWNER TO dc_user;

--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 217
-- Name: deathPerson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dc_user
--

ALTER SEQUENCE public."deathPerson_id_seq" OWNED BY public."deathPerson".id;


--
-- TOC entry 220 (class 1259 OID 16437)
-- Name: persons; Type: TABLE; Schema: public; Owner: dc_user
--

CREATE TABLE public.persons (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    date_naissance date,
    nationalite character varying(100),
    categorie character varying(100),
    description text,
    is_alive boolean DEFAULT true NOT NULL,
    deceased_at date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by integer
);


ALTER TABLE public.persons OWNER TO dc_user;

--
-- TOC entry 219 (class 1259 OID 16436)
-- Name: persons_id_seq; Type: SEQUENCE; Schema: public; Owner: dc_user
--

CREATE SEQUENCE public.persons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.persons_id_seq OWNER TO dc_user;

--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 219
-- Name: persons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dc_user
--

ALTER SEQUENCE public.persons_id_seq OWNED BY public.persons.id;


--
-- TOC entry 224 (class 1259 OID 16498)
-- Name: playerSelection; Type: TABLE; Schema: public; Owner: dc_user
--

CREATE TABLE public."playerSelection" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    alive_person_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    points integer
);


ALTER TABLE public."playerSelection" OWNER TO dc_user;

--
-- TOC entry 223 (class 1259 OID 16497)
-- Name: playerSelection_id_seq; Type: SEQUENCE; Schema: public; Owner: dc_user
--

CREATE SEQUENCE public."playerSelection_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."playerSelection_id_seq" OWNER TO dc_user;

--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 223
-- Name: playerSelection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dc_user
--

ALTER SEQUENCE public."playerSelection_id_seq" OWNED BY public."playerSelection".id;


--
-- TOC entry 226 (class 1259 OID 24813)
-- Name: regles; Type: TABLE; Schema: public; Owner: dc_user
--

CREATE TABLE public.regles (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    nom character varying(150) NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    valeur integer
);


ALTER TABLE public.regles OWNER TO dc_user;

--
-- TOC entry 225 (class 1259 OID 24812)
-- Name: regles_id_seq; Type: SEQUENCE; Schema: public; Owner: dc_user
--

CREATE SEQUENCE public.regles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regles_id_seq OWNER TO dc_user;

--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 225
-- Name: regles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dc_user
--

ALTER SEQUENCE public.regles_id_seq OWNED BY public.regles.id;


--
-- TOC entry 216 (class 1259 OID 16386)
-- Name: users; Type: TABLE; Schema: public; Owner: dc_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100),
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'joueur'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'joueur'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO dc_user;

--
-- TOC entry 215 (class 1259 OID 16385)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dc_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO dc_user;

--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dc_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3336 (class 2604 OID 16476)
-- Name: alivePerson id; Type: DEFAULT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."alivePerson" ALTER COLUMN id SET DEFAULT nextval('public."alivePerson_id_seq"'::regclass);


--
-- TOC entry 3330 (class 2604 OID 16431)
-- Name: deathPerson id; Type: DEFAULT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."deathPerson" ALTER COLUMN id SET DEFAULT nextval('public."deathPerson_id_seq"'::regclass);


--
-- TOC entry 3332 (class 2604 OID 16440)
-- Name: persons id; Type: DEFAULT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.persons ALTER COLUMN id SET DEFAULT nextval('public.persons_id_seq'::regclass);


--
-- TOC entry 3338 (class 2604 OID 16501)
-- Name: playerSelection id; Type: DEFAULT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."playerSelection" ALTER COLUMN id SET DEFAULT nextval('public."playerSelection_id_seq"'::regclass);


--
-- TOC entry 3340 (class 2604 OID 24816)
-- Name: regles id; Type: DEFAULT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.regles ALTER COLUMN id SET DEFAULT nextval('public.regles_id_seq'::regclass);


--
-- TOC entry 3327 (class 2604 OID 16389)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3520 (class 0 OID 16473)
-- Dependencies: 222
-- Data for Name: alivePerson; Type: TABLE DATA; Schema: public; Owner: dc_user
--

COPY public."alivePerson" (id, nom, prenom, categorie, annee_naissance, nationalite, a_verifier, statut, created_by, date_naissance) FROM stdin;
46	Pretti	Alex	Homme/Femme politique	1988	Américain	Identite peu documentee - a confirmer	validee	\N	\N
11	Parker	Corey	Acteur/Actrice	1965	Américain	\N	validee	\N	1965-07-08
1	Duong	Alex	Acteur/Actrice	1984	Américain	\N	validee	\N	1984-03-20
2	Head	Anthony	Acteur/Actrice	1954	Anglais	\N	validee	\N	1954-02-20
3	Starr	Beau	Acteur/Actrice	1944	Américain	\N	validee	\N	1944-09-01
4	Salomone	Bruno	Acteur/Actrice	1970	Francais	\N	validee	\N	1970-07-13
5	O'Hara	Catherine	Acteur/Actrice	1954	Américaine	\N	validee	\N	1954-03-04
6	Nobel	Chantal	Acteur/Actrice	1948	Française	\N	validee	\N	1948-11-23
32	Morin	Edgar	Ecrivain/Ecrivaine	1921	Francais	\N	decedee	\N	1921-07-08
8	Norris	Chuck	Acteur/Actrice	1940	Américain	\N	validee	\N	1940-03-10
9	Maurier	Claire	Acteur/Actrice	1929	Française	\N	validee	\N	1929-03-27
10	Longet	Claudine	Acteur/Actrice	1942	Française	\N	validee	\N	1942-01-29
12	Chase	Daveigh	Acteur/Actrice	1990	Américaine	\N	validee	\N	1990-07-24
13	Gibb	Donald	Acteur/Actrice	1954	Américain	Statut a verifier - un deces en 2024 a ete rapporte dans la presse, non confirme avec certitude	validee	\N	1954-08-06
14	Dane	Eric	Acteur/Actrice	1972	Américain	\N	validee	\N	1972-11-09
15	Beek	James Van Der	Acteur/Actrice	1977	Américain	\N	validee	\N	1977-03-08
16	Ōba	Kenji	Acteur/Actrice	1955	Japonais	\N	validee	\N	1955-02-05
17	Byrne	Michael	Acteur/Actrice	1943	Anglais	\N	validee	\N	1943-11-07
18	Farès	Nadia	Acteur/Actrice	1968	Française	\N	validee	\N	1968-12-20
19	Baye	Nathalie	Acteur/Actrice	1948	Française	\N	validee	\N	1948-07-06
20	Brendon	Nicholas	Acteur/Actrice	1971	Américain	\N	validee	\N	1971-04-12
21	Muldoon	Patrick	Acteur/Actrice	1968	Américain	\N	validee	\N	1968-09-27
22	Deny	Pierre	Acteur/Actrice	1956	Francais	\N	validee	\N	1956-07-12
23	Duvall	Robert	Acteur/Actrice	1931	Américain	\N	validee	\N	1931-01-05
24	Liotard	Thérèse	Acteur/Actrice	1946	Française	\N	validee	\N	1946-05-06
25	Noonan	Tom	Acteur/Actrice	1951	Américain	\N	validee	\N	1951-04-12
26	Bhosle	Asha	Chanteur/Chanteuse	1933	Indienne	\N	validee	\N	1933-09-08
27	Arnold	Brad	Chanteur/Chanteuse	1978	Américain	\N	validee	\N	1978-09-27
28	Dam	José van	Chanteur/Chanteuse	1940	Belge	\N	validee	\N	1940-08-25
29	Naouri	Aldo	Ecrivain/Ecrivaine	1937	Francais	\N	validee	\N	1937-12-22
30	Antunes	António Lobo	Ecrivain/Ecrivaine	1942	Portugais	\N	validee	\N	1942-09-01
31	Ginzburg	Carlo	Ecrivain/Ecrivaine	1939	Italien	\N	validee	\N	1939-04-15
33	Gall	François	Ecrivain/Ecrivaine	1922	Francais	Identite a verifier - possible confusion avec France Gall (chanteuse, decedee en 2018)	validee	\N	1922-11-09
35	Bouchardeau	Huguette	Ecrivain/Ecrivaine	1935	Française	\N	validee	\N	1935-06-01
36	Jospin	Lionel	Ecrivain/Ecrivaine	1937	Francais	\N	validee	\N	1937-07-12
37	Satrapi	Marjane	Ecrivain/Ecrivaine	1969	Française	\N	validee	\N	1969-11-22
38	Charef	Mehdi	Ecrivain/Ecrivaine	1952	Francais	\N	validee	\N	1952-10-24
39	Manninger	Alex	Footballeur/Footballeuse	1977	Autrichien	\N	validee	\N	1977-06-04
40	Bergougnoux	Bryan	Footballeur/Footballeuse	1983	Francais	\N	validee	\N	1983-01-12
41	Roy	Éric	Footballeur/Footballeuse	1967	Francais	\N	validee	\N	1967-09-26
42	Nallo	Fleury Di	Footballeur/Footballeuse	1943	Francais	\N	validee	\N	1943-04-20
43	Henry	Joël	Footballeur/Footballeuse	1963	Francais	\N	validee	\N	1963-04-19
44	Courbis	Rolland	Footballeur/Footballeuse	1953	Francais	\N	validee	\N	1953-08-12
45	Steinmetz	Thierry	Footballeur/Footballeuse	1983	Francais	\N	validee	\N	1983-07-09
47	Santini	André	Homme/Femme politique	1940	Francais	\N	validee	\N	1940-10-20
48	Frank	Barney	Homme/Femme politique	1940	Américain	\N	validee	\N	1940-03-31
49	Chirac	Bernadette	Homme/Femme politique	1933	Française	\N	validee	\N	1933-05-18
50	Colvin	Claudette	Homme/Femme politique	1939	Américaine	\N	validee	\N	1939-09-05
51	Collins	Jason	Basketteur/Basketteuse	1978	Américain	Categorie corrigee - mal etiquete Homme/Femme politique sur la source, il s'agit du joueur de NBA	validee	\N	1978-12-02
52	Deranque	Quentin	Homme/Femme politique	2002	Francais	Identite peu documentee - a confirmer	validee	\N	2002-07-13
53	Good	Renee Nicole	Homme/Femme politique	1988	Américaine	Identite peu documentee - a confirmer	validee	\N	1988-05-14
54	Bossi	Umberto	Homme/Femme politique	1941	Italien	\N	validee	\N	1941-09-19
55	Ibrahim	Abdullah	Musicien/Musicienne	1934	Africain du sud	\N	validee	\N	1934-10-09
56	Belkacem	Areski	Musicien/Musicienne	1940	Francais	\N	validee	\N	1940-01-23
57	Calbo	\N	Musicien/Musicienne	1973	Francais	\N	validee	\N	1973-09-22
58	Lott	Felicity	Musicien/Musicienne	1947	Anglaise	\N	validee	\N	1947-05-08
59	Michael	Frank	Musicien/Musicienne	1947	Francais	Nationalite corrigee - source indiquait Italien, il s'agit d'un chanteur francais	validee	\N	1947-05-07
60	Patti	Guesch	Musicien/Musicienne	1946	Française	\N	validee	\N	1946-03-16
61	Solari	Indio	Musicien/Musicienne	1949	Argentin	\N	validee	\N	1949-01-17
62	Forté	John	Musicien/Musicienne	1975	Américain	\N	validee	\N	1975-01-30
63	Loana	\N	Musicien/Musicienne	1977	Française	\N	validee	\N	1977-08-30
64	Thomas	Michael Tilson	Musicien/Musicienne	1944	Américain	\N	validee	\N	1944-12-21
65	Tree	Oliver	Musicien/Musicienne	1993	Américain	\N	validee	\N	1993-06-29
66	Campbell	Phil	Musicien/Musicienne	1961	Anglais	\N	validee	\N	1961-05-07
67	Rollins	Sonny	Musicien/Musicienne	1930	Américain	\N	validee	\N	1930-09-07
68	Garel	Sophie	Musicien/Musicienne	1942	Française	\N	validee	\N	1942-04-22
72	Macron	Emmanuel	Homme/Femme politique	1977	Français(e)	\N	decedee	4	1977-12-21
71	trump	Donald	Homme/Femme politique	1946	Américain(e)	\N	decedee	4	1946-06-14
73	Mikołajuw	Paweł Ryszard (dit "Popek")	Rappeur / Combattant MMA	1978	Polonais(e)	Source : Wikipedia (Popek), recoupé avec recherche web générale, aucune source fiable ne rapporte un décès — Notes : Nom de scène 'Popek' (Firma, Popek Monster Bydgostia). Aucune faute de frappe à corriger, entrée univoque.	validee	\N	1978-12-02
74	Willis	Bruce	Acteur/Actrice	1955	Américain(e)	Source : Wikipedia (Bruce Willis) ; déclarations récentes (janvier 2026) de son épouse Emma Heming Willis sur son état de santé — Notes : Atteint de démence fronto-temporale, retiré des écrans depuis 2022, vit dans un cadre médicalisé sécurisé mais est en vie selon les informations les plus récentes (2026).	validee	\N	1955-03-19
75	Andress	Ursula	Acteur/Actrice	1936	Suisse	Source : Wikipedia (Ursula Andress) ; articles de presse (L'Avenir, Radio Lac, mars 2026) sur son 90e anniversaire — Notes : A fêté ses 90 ans le 19 mars 2026, retraitée du cinéma. Rumeur de décès ancienne et infondée mentionnée par certains sites (Médiamass) — écartée.	validee	\N	1936-03-19
76	Dutronc	Jacques	Chanteur/Chanteuse (également acteur)	1943	Français(e)	Source : Notoriété publique et actualité 2026 (tournée 'Dutronc & Dutronc' avec son fils Thomas Dutronc) — Notes : 83 ans en 2026, toujours actif musicalement avec son fils. Informations de type 'nouvel album'/'palmarès' issues de sites satiriques (Médiamass) écartées.	validee	\N	1943-04-28
77	Roux	Guy (Guy Marcel Roux)	Entraîneur de football	1938	Français(e)	Source : Wikipédia (Guy Roux) ; démenti officiel de son entourage à une rumeur de décès circulant en 2026 — Notes : Une fausse rumeur de décès (4 février 2026) a circulé, provenant du site 'Necropedia' qui publie des nécrologies fictives/anticipées à but humoristique (non fiable, confirmé par recherche dédiée) ; son porte-parole a démenti ce décès. Célèbre ex-entraîneur de l'AJ Auxerre, 87-88 ans en 2026. Confiance 'medium' du fait de la circulation active de rumeurs contradictoires, malgré le démenti.	validee	\N	1938-10-18
78	Benguigui	Jean	Acteur/Actrice	1944	Français(e)	Source : Wikipedia (Jean Benguigui), AlloCiné, DVDFr — né à Oran, connu pour Buffet froid, Les Fugitifs, Astérix et Obélix: Mission Cléopâtre — Notes : Attention : à ne pas confondre avec sa fille Valérie Benguigui (actrice, décédée en 2013) ni avec Yamina Benguigui (réalisatrice/politique). Certains résultats de recherche lui attribuaient à tort une participation à 'Léon' et 'Goodfellas' (hollywoodiens) — filmographie erronée, écartée. Aucune information de décès trouvée.	validee	\N	1944-04-08
79	Durand	Guillaume	Animateur/Animatrice TV et radio, journaliste	1952	Français(e)	Source : Wikipedia (Guillaume Durand, journaliste) ; Puremédias/Ozap — Notes : Anime La Matinale sur Radio Classique depuis 2009. Homonyme possible avec d'autres 'Guillaume Durand' mais le profil de journaliste/animateur TV correspond clairement au personnage attendu dans ce contexte.	validee	\N	1952-09-23
80	Bohringer	Richard	Acteur/Actrice	1942	Français(e)	Source : AlloCiné, Purepeople, Médiamass (démenti de rumeur de décès de juin 2026) — Notes : Une fausse rumeur de décès a circulé fin juin 2026 sur les réseaux sociaux ; démentie officiellement par son entourage. Il est bien vivant, âgé de 84 ans.	validee	\N	1942-01-16
81	Nicholson	Jack	Acteur/Actrice	1937	Américain(e)	Source : Wikipedia, Fox News (photo anniversaire), Médiamass (démenti canular) — Notes : Faute de frappe corrigée : "Nickolson" -> "Nicholson". Une rumeur de décès (canular) a circulé en juin 2026, démentie ; il a fêté ses 89 ans le 22 avril 2026.	validee	\N	1937-04-22
82	Eastwood	Clint	Acteur/Actrice	1930	Américain(e)	Source : Wikipedia, World of Reel, The Spokesman-Review (juin 2026) — Notes : A fêté ses 96 ans le 31 mai 2026. Son fils Kyle a indiqué qu'il est désormais retraité du cinéma.	validee	\N	1930-05-31
83	Majors	Lee	Acteur/Actrice	1939	Américain(e)	Source : Wikipedia, Who's Alive and Who's Dead, IMDb — Notes : Nom de naissance Harvey Lee Yeary. Toujours en vie et actif (apparitions publiques) à 87 ans en 2026.	validee	\N	1939-04-23
84	Biden	Joe (Joseph Robinette Biden Jr.)	Homme/Femme politique	1942	Américain(e)	Source : The Washington Post, CNN (28 juin 2026) — Notes : Ancien président des États-Unis (2021-2025). Toujours actif politiquement en juin 2026 (discours en soutien au Parti démocrate) ; traite un cancer de la prostate métastasé aux os.	validee	\N	1942-11-20
85	Zidi	Claude	Réalisateur/Réalisatrice	1934	Français(e)	Source : Wikipédia (fr), Médiamass (démenti de rumeur de décès du 1er juillet 2026) — Notes : Une fausse annonce de décès (générée par un site satirique de 'nécrologies anticipées', Nécropédia, datant fictivement du 3 juillet 2026) a circulé sur les réseaux sociaux ; formellement démentie par son entourage. Il est vivant, âgé de 91 ans.	validee	\N	1934-07-25
86	Moine	Claude (nom de scène : Eddy Mitchell)	Chanteur/Chanteuse	1942	Français(e)	Source : Wikipedia, Larousse, Médiamass (démenti rumeur de décès fin juin 2026) — Notes : Vrai nom Claude Moine. Une rumeur de décès a circulé fin juin 2026 sur Twitter/X, démentie par son porte-parole. En période de repos suite à des soucis de santé ayant perturbé sa tournée 2025.	validee	\N	1942-07-03
87	Sannier	Henri	Animateur/Animatrice TV / Journaliste sportif	1947	Français(e)	Source : Wikipédia (fr/en) ; France Bleu (aucune mention de décès, dernière actualité: publication d'un livre en février 2025) — Notes : Aucune correction nécessaire, nom correctement orthographié. Journaliste sportif et présentateur JT (Antenne 2/France 3), maire d'Eaucourt-sur-Somme depuis 1977. Aucune trace de décès trouvée.	validee	\N	1947-09-07
88	Blatter	Joseph "Sepp"	Homme d'affaires / Dirigeant sportif (ancien président FIFA)	1936	Suisse	Source : Articles euronews.com et dhnet.be (2026) mentionnant Blatter à 90 ans, sous dialyse, toujours actif dans les médias — Notes : Une première recherche a produit une réponse erronée du moteur de recherche affirmant un décès en 2015 (confusion probable) ; recherche de vérification confirme qu'il est vivant en 2026 (fête ses 90 ans, critique publiquement Infantino et la Coupe du monde 2026).	validee	\N	\N
89	Lama	Serge	Chanteur/Chanteuse	1943	Français(e)	Source : Wikipédia ; L'Internaute (fin de carrière annoncée en 2022 avec l'album "Aimer", prix reçu en février 2023) — Notes : Nom correctement orthographié. A pris sa retraite de la scène en 2022 mais aucune information de décès trouvée.	validee	\N	1943-02-11
90	Allen	Woody	Réalisateur/Réalisatrice	1935	Américain(e)	Source : AlloCiné (projet de tournage en Espagne en 2026) ; Médiamass (démenti de rumeur de décès d'octobre 2025) — Notes : Correction orthographique: "Woddy" -> "Woody" Allen. Une rumeur de décès a circulé en octobre 2025 mais a été démentie ; il prépare un tournage en Espagne (démarrage prévu le 5 octobre 2026).	validee	\N	1935-12-01
162	Chomsky	Noam	Linguiste/Philosophe	1928	Américain(e)	Source : Wikipedia (en) — Notes : Aucune correction nécessaire. A eu un AVC en juin 2023 et vit désormais au Brésil ; toujours vivant selon la dernière mise à jour consultée.	validee	\N	1928-12-07
91	Collins	Phil	Chanteur/Chanteuse	1951	Britannique	Source : OUI FM ; Médiamass (rumeur de décès du 27 juin 2026 démentie par son porte-parole) — Notes : Problèmes de santé connus (opérations du genou, séquelles de COVID, diabète de type 2) mais vivant. Intronisé au Rock and Roll Hall of Fame en tant qu'artiste solo en 2026.	validee	\N	1951-01-30
92	Dufoix	Georgina	Homme/Femme politique	1942	Française	Source : Wikipédia (fr) ; Who's Who in France — Notes : Divergence de sources sur l'année de naissance: certaines sources (anniversaire-celebrite.com) indiquent 1943 (16 février), Wikipédia indique 1942 (même jour/mois). Ancienne ministre des Affaires sociales (1984-1986), connue pour l'affaire du sang contaminé. Aucune trace de décès trouvée.	validee	\N	\N
93	Streisand	Barbra	Chanteuse/Actrice	1942	Américaine	Source : Wikipédia ; Médiamass (démenti de rumeur de décès de mai 2026) — Notes : Correction orthographique: "Barbara" -> "Barbra" Streisand. Une fausse rumeur de décès (24 mai 2026, prétendument à 84 ans) a circulé mais a été démentie par son porte-parole ; elle est vivante.	validee	\N	1942-04-24
94	Van Dyke	Dick	Acteur/Actrice	1925	Américain(e)	Source : Wikipedia / CNBC (13 déc 2025, 100e anniversaire) ; rumeur de décès démentie en juin 2026 — Notes : Aucune faute de frappe significative dans les variantes. Une fausse rumeur de décès a circulé en juin 2026 (canular), il est toujours vivant.	validee	\N	1925-12-13
95	Chevènement	Jean-Pierre	Homme politique	1939	Français(e)	Source : Médiamass (rumeur de décès démentie, mars 2026) ; CineHeroes — Notes : Correction orthographique : 'Chevenement' -> 'Chevènement'. Une rumeur infondée de décès a circulé en mars 2026, démentie par son entourage. Un site de nécrologie anticipée ('nécropédia') mentionne une fausse date de décès (28/05/2025) à ne pas retenir.	validee	\N	1939-03-09
96	Foxx	Jamie	Acteur/Actrice	1967	Américain(e)	Source : Hollywood Reporter, E! News (BET Awards juin 2026) — Notes : A eu un grave problème de santé (AVC/hémorragie cérébrale) en 2023, rétabli depuis. Actif publiquement en juin 2026 (BET Awards).	validee	\N	1967-12-13
97	Tiberi	Xavière	Personnalité (épouse d'homme politique, ex-fonctionnaire mise en cause)	1936	Français(e)	Source : Wikipedia (FR/EN) ; Le Temps (procédure abandonnée, article de juin 2026) — Notes : Correction orthographique : 'Xaviere' -> 'Xavière'. Née Casanova, épouse de l'ancien maire de Paris Jean Tiberi, connue pour l'affaire du 'rapport sur la francophonie'. Procédure judiciaire définitivement abandonnée en 2026.	validee	\N	1936-08-22
98	Balkany	Isabelle	Femme politique	1947	Français(e)	Source : CNews, Franceinfo (dossier affaire Balkany, janvier-février 2026) — Notes : Correction orthographique : 'Balkani' -> 'Balkany'. Née Smadja (certaines sources indiquent le 20/09/1947 au lieu du 22/09/1947, incertitude mineure sur le jour exact). Décrite comme 'toujours hospitalisée' en février 2026 mais aucune source ne mentionne un décès ; condamnée avec son mari Patrick Balkany dans l'affaire de fraude fiscale.	validee	\N	1947-09-22
99	de Bourbon	Juan Carlos	Chef d'État (ex-roi)	1938	Espagnol(e)	Source : Wikipedia ; Paris Match Belgique (avril 2026, remise de prix à Paris) — Notes : Correction : 'Ruan Carlos 1er' -> 'Juan Carlos Ier' (roi émérite d'Espagne, a abdiqué en 2014 en faveur de son fils Felipe VI). Vit en exil à Abu Dhabi depuis 2020, effectue des apparitions ponctuelles en Europe (Paris, avril 2026 ; Séville pour une corrida).	validee	\N	1938-01-05
100	Chakiris	George	Acteur/Actrice, danseur	1934	Américain(e)	Source : Wikipedia ; Médiamass (rumeur de décès démentie, février 2026) — Notes : Orthographe habituelle en anglais 'George' (et non 'Georges'). Acteur/danseur connu pour West Side Story et Les Demoiselles de Rochefort. Une rumeur de décès a circulé et a été démentie par son entourage, il est vivant (91 ans en 2026).	validee	\N	1934-09-16
101	Caine	Michael (né Maurice Joseph Micklewhite)	Acteur	1933	Britannique	Source : Wikipédia (FR/EN) ; une fausse rumeur de décès a circulé en 2026 mais a été démentie — Notes : Aucune correction nécessaire, orthographe correcte. Acteur retraité depuis octobre 2023, toujours vivant à ce jour malgré des rumeurs de décès infondées en 2026.	validee	\N	1933-03-14
102	Chaumette	Monique	Actrice	1927	Française	Source : Wikipédia FR (page mise à jour le 3 juin 2026, aucune date de décès mentionnée) — Notes : Actrice française née à Paris en 1927 (99 ans). Aucun élément trouvé confirmant un décès, mais compte tenu de son âge très avancé, une vérification périodique est recommandée.	validee	\N	1927-04-04
103	Dickinson	Angie	Actrice	1931	Américaine	Source : Wikipédia FR (page mise à jour le 14 juin 2026, aucune date de décès mentionnée) — Notes : Des sources contradictoires (fake news datant de 2021) circulent en ligne annonçant un décès non confirmé ; Wikipédia, mise à jour récemment, ne mentionne aucun décès. Actrice américaine connue pour 'Police Woman'.	validee	\N	1931-09-30
104	Balladur	Édouard	Homme politique	1929	Français	Source : Wikipédia FR ; une nécrologie anticipée et une rumeur de décès (avril 2026) ont circulé mais ont été démenties par son entourage — Notes : Ancien Premier ministre (1993-1995), né à Izmir (Turquie). Rumeur de décès non confirmée circulant en 2026, formellement démentie.	validee	\N	1929-05-02
105	Bouvard	Philippe	Animateur TV/Radio, journaliste, humoriste	1929	Français	Source : Wikipédia FR ; des avis de décès non officiels circulent sur des sites tiers (avril 2026) mais Wikipédia ne les corrobore pas — Notes : Des annonces de décès (19 avril 2026) trouvées sur des sites d'avis de décès génériques ne sont pas confirmées par Wikipédia ni par une source de presse fiable ; a annoncé son départ à la retraite en janvier 2025. Statut à vérifier avec prudence en raison de sources contradictoires de faible fiabilité.	validee	\N	1929-12-06
106	Rouland	Jean-Paul	Animateur TV/Radio, écrivain	1928	Français	Source : Wikipédia FR ; aucune annonce de décès trouvée dans la presse — Notes : Correction : le libellé 'J.P Rouland' correspond probablement à Jean-Paul Rouland (et non 'Jean-Pierre'), cocréateur avec son frère Jacques de 'La Caméra invisible' avec Pierre Bellemare. Un homonyme, Jacques Rouland (décédé en 2002), existe également mais ne correspond pas aux initiales J.P. Aucune confirmation de décès trouvée ; à vérifier car il aurait 98 ans en 2026.	validee	\N	1928-05-28
107	Magre	Judith	Actrice	1926	Française	Source : Wikipedia / AlloCiné / programmation théâtrale confirmant une activité jusqu'en juillet 2026 — Notes : Nom fourni déjà correct, aucune faute de frappe à corriger. Actrice française née en 1926, toujours en activité au théâtre selon la programmation 2025-2026.	validee	\N	1926-11-20
126	Zelensky	Volodymyr	Homme politique	1978	Ukrainien(ne)	Source : Wikipedia, sites de presse (Britannica, WEF Davos 2026) — Notes : Président de l'Ukraine depuis 2019, toujours en fonction en 2026 (mandat prolongé du fait de la loi martiale liée à la guerre avec la Russie). Actif publiquement (Forum de Davos janvier 2026).	validee	\N	1978-01-25
108	Mercier	Michèle	Actrice	1939	Française	Source : Wikipedia ; Médiamass (démenti officiel de rumeur de décès) — Notes : Plusieurs rumeurs de décès (hoax) circulent en ligne (dates diverses : 2023, sept. 2025, fév. 2026) mais aucune n'est confirmée par une source fiable ; son entourage a démenti. Actrice connue pour le rôle d'Angélique. Date de naissance exacte (1er ou 28 janvier 1939 selon sources) non confirmée avec certitude absolue, jour non vérifié précisément donc prudence sur le jour exact.	validee	\N	1939-01-01
109	Andrews	Julie	Actrice/Chanteuse	1935	Britannique	Source : Wikipedia ; presse (Emmy Award septembre 2025 pour narration Bridgerton, actualité 2026) — Notes : Nom déjà correct. Toujours active en 2025-2026 comme narratrice dans la série Bridgerton (Netflix).	validee	\N	1935-10-01
110	Minnelli	Liza	Actrice/Chanteuse	1946	Américaine	Source : Wikipedia ; Hello Magazine, Parade (mars 2026, actualités sur sa santé et son mémoire) — Notes : Faute de frappe corrigée : 'Minelli' -> 'Minnelli'. A fêté ses 80 ans en mars 2026, actualités récentes confirment qu'elle est vivante malgré des soucis de santé mineurs annoncés.	validee	\N	1946-03-12
111	Pulver	Liselotte	Actrice	1929	Suisse	Source : Wikipedia ; presse suisse/allemande (Blick, Sarganserländer, 2024-2025) — Notes : Nom déjà correct. Actrice suisse ('Lilo' Pulver), âgée de 96 ans selon articles de 2025 ; ne joue plus depuis 1995 mais toujours vivante selon les dernières informations disponibles. Confirmation à recouper car peu de sources très récentes en 2026.	validee	\N	1929-10-11
112	Loren	Sophia	Actrice	1934	Italienne	Source : Wikipedia ; Mediamass (démenti officiel d'un canular de décès en avril 2026) — Notes : Nom déjà correct. Une rumeur de décès (hoax) a circulé en avril 2026, officiellement démentie par son entourage.	validee	\N	1934-09-20
113	Gyatso	Tenzin (14e Dalaï-Lama)	Chef religieux	1935	Tibétain(e)	Source : Wikipedia / franceinfo (juillet 2026) : a fêté ses 90 ans le 6 juillet 2025, opéré du genou avec succès le 8 juin 2026 à New Delhi, vit à Dharamsala — Notes : Aucune correction nécessaire, nom sans ambiguïté.	validee	\N	1935-07-06
114	Travolta	John	Acteur/Actrice	1954	Américain(e)	Source : IndieWire / Hollywood Reporter (2026) : présent au Festival de Cannes 2026 pour son premier film en tant que réalisateur, Palme d'Or d'honneur — Notes : Aucune ambiguïté.	validee	\N	1954-02-18
115	Séchan	Renaud	Chanteur/Chanteuse	1952	Français(e)	Source : Nostalgie.fr (2026) : concerts au Zénith de Paris les 14-16 mai 2026 pour ses 50 ans de carrière, prépare de nouveaux albums — Notes : Chanteur français bien identifié, nom de scène 'Renaud' = Renaud Séchan.	validee	\N	1952-05-11
116	Lelandais	Nordahl	Autre (ancien militaire, condamné pour meurtres)	1983	Français(e)	Source : France Bleu/ici.fr (2026) : jugé en appel à Colmar pour violences conjugales lors d'un parloir en prison, incarcéré à Ensisheim depuis 2022 — Notes : Faute de frappe corrigée : 'Nordhal' -> 'Nordahl'. Condamné pour les meurtres de Maëlys De Araujo et du caporal Arthur Noyer ; actuellement incarcéré.	validee	\N	1983-02-18
117	Fox	Michael J.	Acteur/Actrice	1961	Canadien(ne) (naturalisé américain)	Source : TMZ (avril 2026) 'Michael J. Fox Is Alive, Despite Concern After CNN's Remembering Post' ; son représentant a confirmé sa présence au PaleyFest — Notes : Une rumeur de décès infondée a circulé en avril 2026 suite à un article CNN publié par erreur puis supprimé ; l'acteur, atteint de la maladie de Parkinson depuis 1991, est bien vivant.	validee	\N	1961-06-09
118	Gascoigne	Paul	Footballeur	1967	Britannique	Source : NewsNow / Ticketmaster (2026) : participera à un événement 'Lunch with the Three Lions' le 4 décembre 2026 à Londres — Notes : Ancien footballeur anglais surnommé 'Gazza', reste actif dans des événements publics en 2026.	validee	\N	1967-05-27
119	Daval	Jonathann	Autre (condamné, affaire judiciaire)	1984	Français(e)	Source : Wikipédia (Affaire Daval), Legit.ng, presse française (France Bleu/CNEWS) - juin/juillet 2026 — Notes : Orthographe corrigée : 'Jonathann Daval' (avec deux 'n'), condamné à 25 ans de réclusion pour le meurtre de son épouse Alexia. Actualité récente (2026) : relaxé en appel dans une affaire annexe de dénonciation calomnieuse. Il purge sa peine, en vie.	validee	\N	1984-01-16
120	Weinstein	Harvey	Producteur de cinéma	1952	Américain(e)	Source : TMZ (1-2 juillet 2026), IBTimes UK - hospitalisation à Bellevue après défaillance cardiaque liée à une pneumonie — Notes : Actualité très récente (1-2 juillet 2026) : incarcéré à Rikers Island, a subi une insuffisance cardiaque liée à une pneumonie, transféré à l'hôpital, en cours de rétablissement selon TMZ. Vivant mais état de santé fragile (leucémie myéloïde chronique, maladie coronarienne, diabète).	validee	\N	1952-03-19
121	Qassem	Naïm	Chef religieux / Homme politique	1953	Libanais(e)	Source : Wikipedia, Times of Israel (mai 2026) - secrétaire général du Hezbollah depuis octobre 2024 — Notes : Secrétaire général du Hezbollah depuis le 29 octobre 2024 (succession de Hassan Nasrallah). Des sources d'avril 2026 rapportent une revendication non confirmée de l'armée israélienne selon laquelle il aurait été tué dans une frappe à Beyrouth ; le Hezbollah n'a pas confirmé sa mort et des déclarations publiques lui sont attribuées après cette date (mai 2026), donc considéré vivant, mais avec incertitude compte tenu du contexte de guerre en cours.	validee	\N	\N
122	Akihito	\N	Chef d'État (empereur émérite)	1933	Japonais(e)	Source : The Japan Times (juillet 2025) - hospitalisations et traitement cardiaque, empereur émérite du Japon depuis son abdication en 2019 — Notes : Empereur émérite du Japon (a abdiqué en 2019 en faveur de son fils Naruhito). Problèmes cardiaques récurrents documentés (insuffisance cardiaque, arythmie, ischémie myocardique silencieuse) avec plusieurs hospitalisations en 2022 et 2025 ; dernière information trouvée date de juillet 2025 (état stabilisé après traitement), aucune confirmation de décès trouvée mais pas de source datée de 2026 confirmant son état actuel.	validee	\N	1933-12-23
123	Farrugia	Dominique	Humoriste / Réalisateur	1962	Français(e)	Source : AlloCiné, Wikipedia - biographie de l'humoriste, cofondateur des Nuls — Notes : Acteur, réalisateur, producteur et humoriste français, cofondateur du groupe Les Nuls. Aucune actualité de décès ou de problème de santé grave trouvée.	validee	\N	1962-09-02
124	Balkany	Patrick	Homme politique	1948	Français(e)	Source : Wikipedia (mise à jour mai 2026), Les Jours - ancien maire de Levallois-Perret — Notes : Ancien maire de Levallois-Perret, condamné pour fraude fiscale en 2019. Aucune information de décès trouvée dans les sources consultées (dont une mise à jour Wikipedia de mai 2026).	validee	\N	1948-08-16
125	Metuktire	Raoni	Chef indigène / militant écologiste	1930	Brésilien(ne)	Source : Wikipedia (Raoni Metuktire), sites biographiques recoupés — Notes : Chef du peuple Kayapo, figure de la défense de l'Amazonie. Date de naissance exacte incertaine selon les sources (1930 à 1934 selon les versions) ; 1930 est la valeur la plus souvent citée. Hospitalisé à plusieurs reprises ces dernières années mais aucune source ne rapporte son décès à ce jour (juillet 2026).	validee	\N	\N
127	Olivier	Monique	Autre (condamnée, ex-complice de crimes - affaire Fourniret)	1948	Française	Source : Presse judiciaire (France Bleu, France Info, Village Justice) — Notes : Ex-épouse et complice du tueur en série Michel Fourniret, condamnée à la réclusion criminelle à perpétuité. En février 2026, sortie de prison encadrée pour participer aux recherches du corps de Lydie Logé dans l'Orne. Toujours détenue et vivante à cette date.	validee	\N	1948-10-31
128	Biétry	Charles	Journaliste sportif / Animateur	1943	Français(e)	Source : France Info, Wikipedia, interview 20h30 le dimanche (France 2, 14 juin 2026) — Notes : Correction orthographique : "Bietry" -> "Biétry". Atteint de la maladie de Charcot (SLA) depuis 2023, a annoncé vouloir recourir au suicide assisté en Suisse, mais toujours vivant au 14 juin 2026 selon une interview récente ("tant que les poumons résistent, je suis toujours dans le match").	validee	\N	1943-11-05
129	Mashal (Meshaal)	Khaled	Homme politique (chef du bureau politique du Hamas)	1956	Palestinien(ne)	Source : Al Jazeera (février 2026), Wikipedia, Britannica — Notes : Correction orthographique : "Mechaal" -> "Mashal"/"Meshaal". Chef par intérim du bureau politique du Hamas depuis octobre 2024 après l'assassinat de ses deux prédécesseurs. Toujours actif publiquement en février 2026 (déclarations sur le désarmement de Gaza).	validee	\N	1956-05-28
130	Kessaci	Amine	Militant associatif / Homme politique	2003	Français(e)	Source : Wikipedia (Amine Kessaci), France Info, Marsactu — Notes : Correction orthographique : "Khessaci" -> "Kessaci". Militant écologiste et anti-narcotrafic à Marseille, fondateur du collectif "Conscience". Candidat aux municipales 2026 sur la liste de Benoît Payan à Marseille. Vit sous protection policière du fait de menaces liées à son engagement, mais toujours vivant.	validee	\N	2003-10-10
131	Bessone	Nicolas	Magistrat (procureur de la République)	1968	Français(e)	Source : Articles France 3 Régions, Gazette du Palais, franceinfo, MSN (2023-2026) sur le procureur de la République de Marseille — Notes : Identifié comme Nicolas Bessone, procureur de la République de Marseille depuis novembre 2023, connu médiatiquement pour la lutte contre le narcotrafic (placé sous protection policière). Aucune autre personnalité notable homonyme trouvée (un chercheur en IA et un développeur argentin portent aussi ce nom mais ne correspondent pas au profil 'personnalité publique française' du contexte). Année de naissance estimée (~1968) à partir de son âge rapporté (57 ans) dans des articles récents, jour/mois exact non trouvé.	validee	\N	\N
132	Aufray	Hugues	Chanteur/Chanteuse	1929	Français(e)	Source : Sites de billetterie/tournées (Ticketmaster, InfoConcert, Songkick, Agenda Culturel) annonçant une tournée 2026 — Notes : Aucune faute de frappe à corriger. Toujours en activité, tournée 'Escapada !' annoncée en 2026 (à l'âge de 96 ans, bientôt 97).	validee	\N	\N
133	Perret	Pierre	Chanteur/Chanteuse	1934	Français(e)	Source : Wikipedia, site officiel pierreperret.fr, Linternaute biographie — Notes : Né le 9 juillet 1934 à Castelsarrasin. Aucune information de décès trouvée dans les sources consultées.	validee	\N	1934-07-09
134	Lavilliers	Bernard	Chanteur/Chanteuse	1946	Français(e)	Source : Wikipedia, Universalis, Nostalgie biographie — Notes : Nom de naissance Bernard Oulion. Né le 7 octobre 1946 à Saint-Étienne. Aucune information de décès trouvée.	validee	\N	1946-10-07
135	Séguéla	Jacques	Homme d'affaires (publicitaire)	1934	Français(e)	Source : Wikipedia FR, Wikidata, site officiel jacques-seguela.com — Notes : Publicitaire français, cofondateur de RSCG (devenu Havas-Advertising/Euro RSCG). Aucune mention de décès trouvée ; toujours présenté comme actif/vivant dans les sources récentes.	validee	\N	1934-02-23
136	Grisoni-Chappuis	Nicole Fernande (nom de scène : Nicoletta)	Chanteur/Chanteuse	1944	Français(e)	Source : Wikipedia (EN), Nostalgie biographie, Linternaute biographie — Notes : Née Nicole Fernande Grisoni-Chappuis le 11 avril 1944 à Vongy (Thonon-les-Bains). Connue pour 'Mamy Blue' et 'Il est mort le soleil'. Source récente (~1 mois) la décrit comme toujours active à 82 ans ; aucune information de décès trouvée.	validee	\N	1944-04-11
137	Lang	Jack	Homme politique	1939	Français(e)	Source : Wikipedia ; Maitron ; actualité de février 2026 sur sa démission de la présidence de l'Institut du Monde Arabe — Notes : Ancien ministre de la Culture et de l'Éducation nationale. A démissionné en février 2026 de la présidence de l'Institut du Monde Arabe suite à une enquête liée aux fichiers Epstein ; toujours vivant.	validee	\N	1939-09-02
138	Renaud	Line	Chanteur/Chanteuse et Actrice	1928	Français(e)	Source : Point de Vue (interview 2026, démenti des rumeurs) ; sites de célébrités (âge/date de naissance) — Notes : Des rumeurs de décès (fin janvier 2026) ont circulé sur des pages Facebook/YouTube non fiables, mais Line Renaud a personnellement démenti dans une interview à Point de Vue début 2026 en déclarant aller « très très bien ». Aucune source fiable (presse établie, Wikipedia) ne confirme un décès. Statut retenu : vivante, avec prudence en raison des sources contradictoires.	validee	\N	1928-07-02
139	Robin	Muriel	Humoriste / Actrice	1955	Français(e)	Source : Wikipedia ; presse (Molières 2026, tournée « Infiniment Robin ») — Notes : Ordre nom/prénom inversé et orthographe corrigée : « Robin Murielle » → « Muriel Robin ». Active en 2026 : Molière d'honneur reçu le 4 mai 2026, tournée « Infiniment Robin » en 2026-2027.	validee	\N	1955-08-02
140	Sanson	Véronique	Chanteuse	1949	Française	Source : Wikipedia / presse française (Fnac Spectacles, La Seine Musicale) - tournée 2026 confirmée — Notes : Ordre Nom Prénom inversé dans le libellé source, correspond bien à Véronique Sanson, chanteuse française toujours active en 2026 (tournée 'J'ai eu envie de vous revoir').	validee	\N	1949-04-24
141	Sardou	Michel	Chanteur	1947	Français	Source : Mediamass (démenti de rumeur), presse française - anniversaire 79 ans le 26 janvier 2026 — Notes : Une fausse rumeur de décès a circulé fin janvier 2026 suite à une erreur de diffusion sur RMC Story lors d'un hommage pour son 79e anniversaire ; aucun décès réel, rumeur démentie.	validee	\N	1947-01-26
142	Freeman	Morgan	Acteur	1937	Américain	Source : Wikipedia, CNBC (nov. 2025, 88 ans), presse - a eu 89 ans début juin 2026 — Notes : Une rumeur de décès en juin 2026 a été démentie ; l'acteur reste actif professionnellement.	validee	\N	1937-06-01
143	Aldrin	Buzz (Edwin Eugene Aldrin Jr.)	Astronaute	1930	Américain	Source : Wikipedia, phys.org (janvier 2026, 96 ans) - dernier survivant de l'équipage Apollo 11 — Notes : Rumeur de décès en juin 2026 confirmée comme un canular ; il est le doyen des astronautes vivants, dernier membre survivant d'Apollo 11 depuis la mort de Jim Lovell en 2025.	validee	\N	1930-01-20
144	Borloo	Jean-Louis	Homme politique	1951	Français	Source : Wikipedia, Mediamass (démenti de rumeur, avril 2026, 75 ans) — Notes : Une fausse rumeur de décès a circulé sur les réseaux sociaux mais a été démentie ; ancien ministre, ex-président de l'UDI, toujours en vie.	validee	\N	1951-04-07
145	Macias	Enrico (Gaston Ghrenassia)	Chanteur	1938	Français	Source : Wikipedia, Mediamass (rumeurs de décès démenties en mars et juin 2026, 87 ans), communiqué de son porte-parole — Notes : Plusieurs rumeurs de décès (mars et fin juin 2026) ont circulé sur les réseaux sociaux, formellement démenties par son porte-parole.	validee	\N	1938-12-11
146	Lloyd	Christopher	Acteur	1938	Américain	Source : Wikipedia, Mediamass (démenti de rumeur, juin 2026), Entertainment Tonight (interview sur son absence de retraite à 86 ans) — Notes : Correction de la casse 'LLoyd' en 'Lloyd'. Acteur connu pour 'Retour vers le futur' (Doc Brown) et 'Taxi'. Rumeur de décès de juin 2026 démentie comme canular.	validee	\N	1938-10-22
147	Merckx	Eddy	Cycliste	1945	Belge	Source : L'Avenir, DH/Les Sports+ (avril-mai 2026) : hospitalisation d'un mois pour infection à la hanche puis retour à domicile le 2 mai 2026 — Notes : Aucune faute de frappe ni ambiguïté. Actualité récente (2026) évoque une hospitalisation pour infection de prothèse de hanche, résolue positivement ; pas de décès.	validee	\N	1945-06-17
148	Moreno	Rita	Actrice	1931	Portoricaine (Américaine)	Source : Wikipedia, Britannica ; rumeur de décès de juin 2026 officiellement démentie par ses représentants (relayée par Mediamass, site connu pour ses canulars de décès) — Notes : Une fausse rumeur de décès a circulé en juin 2026 (démentie). Elle a reçu le Trailblazer in the Arts Award en avril 2026, confirmant qu'elle est bien vivante.	validee	\N	1931-12-11
149	Manilow	Barry	Chanteur	1943	Américain	Source : Rock Cellar Magazine, Deadline, Variety (2026) : reprise de sa tournée d'adieu après un cancer du poumon stade 1 détecté précocement et traité — Notes : Diagnostic de cancer du poumon (stade 1) opéré avec succès en 2026 ; il a repris sa tournée et prépare un nouvel album (« What a Time », juin 2026). Toujours vivant.	validee	\N	1943-06-17
150	Spears	Britney	Chanteuse	1981	Américaine	Source : LA Mag, Marie Claire, E! News (juin-juillet 2026) : résolution d'une affaire de conduite en état d'ivresse, activité sur les réseaux sociaux — Notes : Actualité récente (2026) confirme une vie publique active (affaire judiciaire résolue, réseaux sociaux).	validee	\N	1981-12-02
151	Dhéliat	Évelyne	Animatrice TV / Présentatrice météo	1944	Française	Source : Socialmag.news (28/06/2026) : déclarations sur les projections climatiques ; une rumeur de retraite provenant de Mediamass (site de canulars) écartée — Notes : Date de naissance non revérifiée précisément dans cette recherche (connue par ailleurs comme 15/01/1944) ; une source non fiable (Médiamass) évoquait un départ à la retraite, à ignorer.	validee	\N	1944-01-15
152	Ménez	Bernard	Acteur	1944	Français	Source : Wikipedia, AlloCiné, IMDb, Purepeople : biographie et filmographie à jour (dont un tournage évoqué en 2025) — Notes : Une annonce de décès le 14/10/2025 provient uniquement du site « Nécropédia », qui publie explicitement des nécrologies anticipées (rédigées à l'avance pour des personnes encore vivantes) — information écartée comme non fiable. Les sources de référence (Wikipedia, AlloCiné, IMDb) ne mentionnent aucun décès et le présentent avec des activités récentes. Statut retenu : vivant, avec prudence (confidence medium) faute de confirmation positive explicite très récente.	validee	\N	1944-08-08
153	Vartan	Sylvie	Chanteuse	1944	Française (d'origine bulgare)	Source : Site officiel sylvie-vartan.com, MSN, presse (juin 2026) : retour sur scène, sortie de l'album « Le Palais des Congrès 83 » le 26/06/2026, activité sur Instagram — Notes : Actualité très récente (fin juin 2026) confirme des apparitions publiques et une sortie musicale.	validee	\N	1944-08-15
154	Défays (nom de scène: Richard)	Pierre	Acteur/Actrice	1934	Français(e)	Source : Wikipedia (Pierre Richard) ; démenti d'une rumeur de décès circulée en juin 2026 (Médiamass hoax death rumor site) — Notes : Une rumeur de décès (canular type 'hoax death') a circulé en juin 2026 sur un site de nécrologie fictive (Nécropédia) annonçant sa mort le 12/06/2026, mais elle a été démentie ; l'acteur est toujours vivant au 02/07/2026 selon les sources vérifiées.	validee	\N	1934-08-16
155	Pagny	Florent	Chanteur/Chanteuse	1961	Français(e)	Source : Presse people (Paris Match) sur son cancer du poumon en traitement en 2026 ; page de nécrologie 'fiction' (Nécropédia) explicitement labellisée comme fictive — Notes : Connu pour son cancer du poumon diagnostiqué en 2023, en traitement/rémission suivie médiatiquement. Une page de nécrologie trouvée est explicitement taguée '[Fiction]' annonçant un décès fictif le 21/06/2026 - à ne pas confondre avec un fait réel. Aucune source fiable ne confirme un décès réel à ce jour (02/07/2026).	validee	\N	1961-11-08
156	Middleton (épouse Wales)	Catherine (Kate)	Membre de la famille royale	1982	Britannique	Source : CBS News, HELLO! Magazine, WSLS - apparitions publiques à Wimbledon et Royal Ascot en juin-juillet 2026 — Notes : Princesse de Galles ; a annoncé début 2025 que son cancer était en rémission ; vue publiquement en juin/juillet 2026 (Three Peaks Challenge, Royal Ascot, Wimbledon).	validee	\N	1982-01-09
157	Windsor (Mountbatten-Windsor)	Charles Philip Arthur George	Homme politique / Chef d'État (Monarque)	1948	Britannique	Source : ABC News, Rolling Stone, E! News - annonces sur la réduction de son traitement anticancéreux en 2026 — Notes : Traité pour un cancer diagnostiqué en 2024 ; en 2026 annonce une réduction de son programme de traitement suite à une bonne réponse, mais poursuit ses fonctions royales.	validee	\N	1948-11-14
158	Richards	Keith	Musicien (guitariste, Rolling Stones)	1943	Britannique	Source : Guitar World, NME, Consequence, Billboard - interviews et actualité sur le nouvel album des Rolling Stones 'Foreign Tongues' (2026) — Notes : 82 ans en 2026, actif musicalement (nouvel album des Rolling Stones), a confirmé l'absence de tournée en 2026.	validee	\N	1943-12-18
159	Poutine	Vladimir Vladimirovitch	Homme politique (Président de la Fédération de Russie)	1952	Russe	Source : Franceinfo, TF1 Info - couverture de la guerre en Ukraine et de la situation intérieure russe, juillet 2026 — Notes : Présenté comme potentiellement 'fragilisé' politiquement dans des analyses de presse françaises de juillet 2026, mais aucune source n'indique un décès ; toujours en fonction.	validee	\N	1952-10-07
160	de Borbón y Borbón	Juan Carlos	Homme politique / Ancien Chef d'État (Roi émérite d'Espagne)	1938	Espagnol(e)	Source : Euronews, Histoires Royales - présence à Paris en avril 2026 pour un prix littéraire — Notes : Roi émérite (abdication en 2014), vit en exil aux Émirats arabes unis depuis 2020 en raison d'enquêtes sur des soupçons de fraude fiscale/corruption ; apparu publiquement à Paris en avril 2026.	validee	\N	1938-01-05
161	Brooks	Mel	Acteur/Réalisateur/Humoriste	1926	Américain(e)	Source : Wikipedia (en) ; Forbes, article du 28/06/2026 sur son 100e anniversaire — Notes : Aucune correction nécessaire. A fêté ses 100 ans le 28 juin 2026, toujours actif (documentaire Judd Apatow, projet Spaceballs: The New One).	validee	\N	1926-06-28
163	Buffett	Warren	Homme d'affaires	1930	Américain(e)	Source : CNBC / Forbes, couverture de l'assemblée annuelle Berkshire Hathaway du 2 mai 2026 — Notes : Aucune correction nécessaire. A cédé le poste de PDG à Greg Abel début 2026 mais reste président du conseil et vivant ; a assisté à l'assemblée annuelle du 2 mai 2026 en tant que spectateur.	validee	\N	\N
164	Castro	Raúl	Homme politique	1931	Cubain(e)	Source : Wikipedia (en) ; apparitions publiques rapportées le 15 janvier 2026 à La Havane — Notes : Une rumeur de décès a circulé en avril 2026 mais a été démentie ; une nécrologie du site Nécropédia (nécrologie anticipée, non factuelle) mentionne une date de décès fictive au 2 octobre 2025, à ne pas retenir.	validee	\N	1931-06-03
165	Seillière	Ernest-Antoine	Homme d'affaires	1937	Français(e)	Source : Wikipedia (fr), consulté directement, article à jour au 13/06/2026 — Notes : Le site Nécropédia affiche une 'nécrologie anticipée' donnant une fausse date de décès (14 mars 2026) : le site précise lui-même qu'il s'agit d'un article rédigé par avance, PAS d'une confirmation de décès réel ('anticipée signifie qu'il n'est pas mort'). Wikipedia (fr) ne mentionne aucun décès -> statut retenu : vivant.	validee	\N	1937-12-20
166	Mulliez	Gérard	Homme d'affaires	1931	Français(e)	Source : Wikipédia FR (page Gérard Mulliez, consultée juillet 2026) — Notes : Fondateur du groupe Auchan. Aucune ambiguïté sur l'identité malgré l'inversion nom/prénom parfois vue.	validee	\N	1931-05-13
167	Murdoch	Rupert	Homme d'affaires (magnat des médias)	1931	Australo-américain(e)	Source : Wikipédia FR (page Rupert Murdoch, consultée juillet 2026) — Notes : Une fausse annonce de décès ('death hoax') a circulé en 2026 (relayée par des sites comme Mediamass) mais elle est démentie ; il est bien vivant selon Wikipédia à jour. Ne pas confondre avec un hoax.	validee	\N	1931-03-11
168	de Rothschild	Nadine	Écrivaine / Personnalité mondaine	1932	Française	Source : Wikipédia FR (page Nadine de Rothschild, consultée juillet 2026) — Notes : Faute de frappe corrigée : 'DE ROTSCHILD' -> 'de Rothschild'. Née Nadine Vanrossem, veuve du baron Edmond de Rothschild. Son fils Benjamin de Rothschild est décédé en janvier 2021, à ne pas confondre avec elle.	validee	\N	1932-04-18
169	de Benoist	Alain	Philosophe/Essayiste	1943	Français(e)	Source : Wikipédia FR (page Alain de Benoist, consultée juillet 2026) — Notes : Fondateur du GRECE, figure de la Nouvelle Droite. Identification sans ambiguïté.	validee	\N	1943-12-11
170	Bolsonaro	Jair	Homme politique	1955	Brésilien(ne)	Source : Wikipédia FR / Al Jazeera (consultés juillet 2026) — Notes : Ex-président du Brésil, actuellement incarcéré (peine de 27 ans pour tentative de coup d'État) et hospitalisé début 2026 pour une bronchopneumonie, mais vivant selon les dernières informations disponibles.	validee	\N	1955-03-21
171	Soros	George	Homme d'affaires (financier/philanthrope)	1930	Américain(e)	Source : Wikipédia FR (page George Soros, consultée juillet 2026) — Notes : Faute de frappe/francisation corrigée : 'Georges' -> 'George' (prénom usuel anglicisé). Né György Schwartz à Budapest, naturalisé américain, d'origine hongroise. Une fausse annonce de décès a circulé en juin 2026 mais a été démentie ; il est vivant selon les sources à jour.	validee	\N	1930-08-12
172	Wade	Abdoulaye	Homme politique	1926	Sénégalais(e)	Source : Wikipedia / France 24 / Jeune Afrique — anniversaire de ses 100 ans célébré à Dakar fin mai/début juin 2026, rumeur de décès de février 2026 démentie — Notes : Ancien président du Sénégal (2000-2012). A fêté ses 100 ans le 29 mai 2026. Une rumeur de décès a circulé en février 2026 mais a été démentie.	validee	\N	1926-05-29
173	de Closets	François	Journaliste/Écrivain	1933	Français	Source : Whoswho.fr, Médiamass (démenti de rumeur de décès) — Notes : Journaliste et écrivain français né le 25 décembre 1933. Des rumeurs de décès ont circulé mais ont été démenties ; il serait vivant à 92 ans. Confiance medium car peu d'actualité récente le concernant directement (personnalité peu médiatisée ces dernières années).	validee	\N	1933-12-25
174	Dussollier	André	Acteur	1946	Français	Source : Wikipedia, AlloCiné, Médiamass (démenti de rumeur de décès d'août 2025) — Notes : Correction orthographique : 'Dussolier' -> 'Dussollier'. Acteur né le 17 février 1946 à Annecy. Une fausse rumeur de décès a circulé sur les réseaux sociaux en août 2025, largement démentie ; il est vivant.	validee	\N	1946-02-17
175	Wonder	Stevie	Chanteur/Chanteuse	1950	Américain(e)	Source : Britannica, Médiamass (démenti de rumeur de décès de juin 2026) — Notes : Nom de naissance Stevland Hardaway Morris. Une rumeur de décès (canular) a circulé en juin 2026, formellement démentie par ses représentants le 22 juin 2026.	validee	\N	1950-05-13
176	Drucker	Michel	Animateur/Animatrice TV	1942	Français	Source : Médiamass (démenti de rumeur de décès du 22-23 juin 2026) — Notes : Animateur télé français, 83 ans. Rumeur de décès circulée sur Twitter le 22 juin 2026, démentie par son entourage le 23 juin 2026.	validee	\N	1942-09-12
177	Fonda	Jane	Actrice	1937	Américain(e)	Source : Wikipedia, IMDb, Médiamass (démenti de rumeur de décès de juin 2026) — Notes : Actrice et activiste américaine. Rumeur de décès (canular) démentie en juin 2026 ; toujours active publiquement (opposition à la guerre Iran/États-Unis de 2026).	validee	\N	1937-12-21
178	Gallart	Guilhem	Musicien/Producteur (DJ, hip-hop)	1973	Français(e)	Source : Wikipédia FR (Pone), lerapcetaitmieuxavant.fr — Notes : Connu sous le nom de scène 'Pone', ex-membre du groupe Fonky Family, producteur de rap français. Atteint de sclérose latérale amyotrophique (maladie de Charcot) depuis 2015, mais toujours vivant et actif (autobiographie parue en 2023, aucune information de décès trouvée).	validee	\N	1973-03-07
179	Waterston	Sam	Acteur/Actrice	1940	Américain(e)	Source : Wikipedia (Sam Waterston), présence confirmée à la célébration des 25 ans de Law & Order en janvier 2026 — Notes : Acteur connu pour Jack McCoy dans Law & Order. Aucune information de décès.	validee	\N	1940-11-15
180	Saladin	Olivier	Acteur/Actrice	1952	Français(e)	Source : AlloCiné, TPA.fr — Notes : Acteur des Deschiens et de Boulevard du Palais. Aucune annonce de décès trouvée ; des spectacles lui sont programmés pour 2026-2027.	validee	\N	1952-05-01
181	Jackson	Curtis James III (alias 50 Cent)	Chanteur/Chanteuse (Rappeur)	1975	Américain(e)	Source : Wikipedia (50 Cent), actualités 2026 (tournée mondiale, documentaire, concert à Washington D.C. le 3 juillet 2026) — Notes : Nom de scène '50 Cent'. Actif en 2026 (tournée, documentaire en production).	validee	\N	1975-07-06
182	Schumacher	Michael	Pilote automobile (Formule 1)	1969	Allemand(e)	Source : Motors Inside, articles santé 2026 (motorsactu.com, formule1fr.com) — Notes : Septuple champion du monde de F1. Gravement blessé lors d'un accident de ski en décembre 2013 ; vivrait toujours sous soins constants selon des articles de 2026, mais son état de santé précis n'est jamais confirmé officiellement par la famille — informations à traiter avec prudence.	validee	\N	1969-01-03
183	Dion	Céline	Chanteuse	1968	Canadienne (Québécoise)	Source : Africanews (mars 2026) — annonce d'un retour sur scène à Paris — Notes : Diagnostiquée en décembre 2022 du syndrome de la personne raide (maladie auto-immune rare). A annoncé début 2026 un retour à la scène (concerts à Paris à partir de septembre).	validee	\N	1968-03-30
184	Lear	Amanda	Chanteuse/Artiste	1939	Française	Source : Wikipedia; Mediamass (canular de décès démenti en 2026) — Notes : Vivante et en bonne santé ; des rumeurs de décès (hoax) ont circulé en janvier et mai 2026, officiellement démenties. Sa date de naissance exacte est un mystère volontairement entretenu par elle-même (années citées: 1939/1941/1946/1948/1950, jour 18 juin ou 18 novembre selon les sources) — année de naissance retenue ici (1939) à titre indicatif, incertaine.	validee	\N	\N
185	Baldwin	Alec	Acteur/Actrice	1958	Américain(e)	Source : Wikipedia; Mediamass (canular de décès de mars 2026 démenti) — Notes : Vivant. Rumeur de décès (hoax) en mars 2026, officiellement démentie par ses représentants.	validee	\N	1958-04-03
186	Évenou	Danièle	Actrice	1943	Française	Source : Wikipédia (fr); tpa.fr biographie — Notes : Née à Tunis le 21 février 1943, connue pour le rôle de Marie Lorieux dans « Marie Pervenche ». Aucune information de décès trouvée ; source de mai 2026 la mentionne comme toujours vivante (82 ans).	validee	\N	1943-02-21
187	Schwarzenegger	Arnold	Acteur/Actrice, ancien homme politique	1947	Américain(e) (d'origine autrichienne)	Source : Wikipedia; Mediamass/Snopes (canular de décès de juin 2026 démenti) — Notes : Vivant et en bonne santé. Rumeur de décès (hoax) en juin 2026, officiellement démentie.	validee	\N	1947-07-30
188	Hill (nom de naissance: Girotti)	Terence (Mario)	Acteur/Actrice	1939	Italien(ne)	Source : Wikipedia; Mediamass (canular de décès de juin 2026 démenti) — Notes : De son vrai nom Mario Girotti. Vivant, âgé de 87 ans. Rumeur de décès (hoax) en juin 2026 (page Facebook 'R.I.P.') officiellement démentie par son entourage.	validee	\N	1939-03-29
189	Taylor	Andy	Chanteur/Chanteuse-Guitariste	1961	Britannique	Source : Wikipedia; Men's Journal, Yahoo Entertainment, GB News (mises à jour sur sa santé) — Notes : Guitariste du groupe Duran Duran. Diagnostiqué en 2018 d'un cancer de la prostate métastatique stade 4 (révélé publiquement en 2022), mais toujours vivant et actif (travaux musicaux récents) selon les dernières informations.	validee	\N	1961-02-16
190	Charles III (Windsor)	Charles Philip Arthur George	Chef d'État / Monarque	1948	Britannique	Source : Wikipédia FR ; couverture presse (Yahoo Actus, DH Les Sports+) démentant une fausse rumeur de décès diffusée par Radio Caroline en 2026 — Notes : Roi du Royaume-Uni depuis le 8 septembre 2022. Suit un traitement contre un cancer révélé en février 2024, mais bien vivant à ce jour ; une rumeur de décès (bug informatique d'une radio) a circulé en 2026 et a été démentie.	validee	\N	1948-11-14
191	Ronstadt	Linda	Chanteuse	1946	Américaine	Source : Wikipedia EN, Today.com, Distractify (juin 2026) — Notes : Chanteuse de country rock, née à Tucson (Arizona). Retraitée du chant depuis 2013 suite à un diagnostic de paralysie supranucléaire progressive (PSP) ; a eu une perte de parole/audition après une infection au COVID en 2026 mais a récupéré la parole.	validee	\N	1946-07-15
192	Miossec	Christophe	Chanteur/Auteur-compositeur	1964	Français(e)	Source : Wikipédia FR — Notes : Auteur-compositeur-interprète né à Brest. A dû suspendre une tournée en 2023 pour soigner un cancer des cordes vocales, puis a pu reprendre la tournée l'année suivante.	validee	\N	1964-12-24
193	Bataille	Pascal	Animateur/Animatrice TV et radio	1960	Français(e)	Source : Wikipédia FR (page consultée directement, pas de mention de décès, mentionne une activité d'animateur sur W9 en 2025) — Notes : De nombreuses rumeurs de décès (mars 2025) circulent sur TikTok/YouTube/Facebook, sans confirmation par un média sérieux ; la page Wikipédia ne mentionne aucun décès. Il a annoncé en décembre 2024 être atteint d'un cancer du poumon. À considérer avec prudence : rumeurs de décès non confirmées, probable désinformation, mais pas de source fiable attestant qu'il soit décédé.	validee	\N	1960-01-25
194	Arditi	Pierre	Acteur/Actrice	1944	Français(e)	Source : Wikipédia FR/EN ; Le Tribunal du Net (interview février 2026 où il dément sa propre mort) — Notes : Une rumeur de décès a circulé en décembre 2025 et a été démentie ; en février 2026 il a donné une interview en bonne santé, plaisantant sur ces rumeurs.	validee	\N	1944-12-01
195	Wagner	Robert	Acteur/Actrice	1930	Américain(e)	Source : Wikipédia FR ; Médiamass (démenti de rumeur de décès, mai 2026) — Notes : Acteur né à Détroit, connu pour Pour l'amour du risque et Austin Powers. Une rumeur de décès a circulé en mai 2026 et a été formellement démentie par son entourage ; il a 96 ans.	validee	\N	1930-02-10
196	Neill	Sam (Nigel John Dermot Neill)	Acteur/Actrice	1947	Néo-Zélandais(e)	Source : Variety, Today.com, 1News NZ (avril 2026) — Notes : Né à Omagh (Irlande du Nord), se considère néo-zélandais (détient aussi les nationalités britannique et irlandaise). Diagnostiqué en 2022 d'un lymphome T angioimmunoblastique de stade 3 ; a annoncé fin avril 2026 être en rémission complète (cancer-free) après une thérapie CAR-T.	validee	\N	1947-09-14
197	Ono	Yoko	Artiste/Musicienne	1933	Japonaise (naturalisée américaine)	Source : Wikipedia (Yoko Ono); démenti officiel de ses représentants (15 juin 2026) suite à une rumeur de décès de type canular — Notes : Une rumeur de décès a circulé en juin 2026 mais a été formellement démentie par son entourage. Veuve de John Lennon, artiste et musicienne.	validee	\N	1933-02-18
198	Dench	Judith Olivia (Judi)	Actrice	1934	Britannique	Source : Wikipedia (Judi Dench); interview ITV novembre 2025 évoquant sa perte de vision progressive — Notes : Correction du prénom : 'Judith' correspond à Dame Judi Dench (Judith Olivia Dench). Rumeur de décès en 2026 démentie ; santé fragile (problèmes de vue) mais toujours en vie à 91 ans.	validee	\N	1934-12-09
199	Pacino	Alfredo James (Al)	Acteur	1940	Américain	Source : Wikipedia (Al Pacino); rumeur de décès d'avril 2026 démentie, remise du Sam Wanamaker Award par le Shakespeare's Globe évoquée en 2026 — Notes : Aucune faute de frappe. Rumeur de décès en avril 2026 confirmée comme un canular.	validee	\N	1940-04-25
200	Sheen	Martin	Acteur	1940	Américain	Source : Wikipedia (Martin Sheen); lancement d'un podcast avec sa fille Renée en octobre 2025 ; rumeur de décès de février 2026 démentie officiellement — Notes : Aucune faute de frappe. Rumeur de décès de février 2026 confirmée comme un canular par ses représentants.	validee	\N	1940-08-03
241	Mathy	Michèle dite "Mimie"	Actrice	1957	Française	Source : Wikipedia/IMDB ; actualité 2026 (absence aux Enfoirés 2026 pour raisons de santé, diffusion d'un épisode inédit de Joséphine, ange gardien le 6 juillet 2026) — Notes : Connue pour la série 'Joséphine, ange gardien'. A évoqué des difficultés à marcher liées à son achondroplasie, mais reste en activité.	validee	\N	1957-07-08
201	Moine (nom de scène : Mitchell)	Claude (Eddy)	Chanteur/Acteur	1942	Français	Source : Wikipedia (Eddy Mitchell) ; ParisMatch.be mars 2025 (annulation de tournée pour raisons de santé) ; démenti de son entourage suite à une rumeur de décès fin juin 2026 — Notes : Faute de frappe corrigée : 'Mitchel' -> 'Mitchell'. Une page de nécrologie datée du 20 avril 2026 a été retrouvée mais elle est explicitement labellisée comme un contenu de type 'nécrologie anticipée/fiction' par le site source, et non confirmée par une source de presse fiable ; Wikipedia ne mentionne aucune date de décès. Santé fragile connue (tournée annulée en 2025) mais décès non confirmé à ce jour.	validee	\N	1942-07-03
202	Lara	Catherine	Chanteuse/Violoniste	1945	Française	Source : Wikipedia / Purepeople / actualité 2026 (tournée "Identités") — Notes : Née Catherine Bodet à Poissy. Une source (Universal Music) indique le 22 mai 1945 au lieu du 29 mai 1945, mais la majorité des sources s'accordent sur le 29 mai. Toujours active professionnellement en 2026.	validee	\N	1945-05-29
203	Mouskouri	Nana (Ioanna)	Chanteuse	1934	Grecque	Source : Wikipedia ; franceinfo (hommage aux Victoires de la musique, février 2026) — Notes : Une fausse rumeur de décès a circulé (mentionnée par Médiamass) mais elle est bien vivante ; honorée par une Victoire d'honneur en février 2026 à 91 ans.	validee	\N	1934-10-13
204	Radcliffe	Daniel	Acteur	1989	Britannique	Source : Wikipedia ; actualité Broadway "Every Brilliant Thing", février 2026 — Notes : Faute de frappe corrigée : "Ratcliffe" -> "Radcliffe" (acteur de la saga Harry Potter).	validee	\N	1989-07-23
205	Pietri	Julie	Chanteuse	1955	Française	Source : Wikipedia (EN) ; Fnac ; Nostalgie — Notes : Divergence entre sources sur la date de naissance : 1er mai 1955 (Wikipedia) vs 1er mai 1957 (autres sources) ; jour/mois cohérents mais année incertaine, donc date_naissance laissée à null. Née à Alger. A annoncé publiquement en 2023 lutter contre un cancer de l'endomètre, mais aucune source ne mentionne un décès.	validee	\N	\N
206	Beckham	David	Footballeur	1975	Britannique	Source : Wikipedia ; actualité anoblissement (knighthood) 2025/2026 (Sir David Beckham) — Notes : Anobli (knighthood) en 2025, cérémonie formelle fin 2025.	validee	\N	1975-05-02
207	Cowens	Dave	Basketteur	1948	Américain(e)	Source : Wikipedia ; Basketball-Reference ; NBA.com — Notes : Ancien joueur et entraîneur NBA (Boston Celtics), MVP 1973, Hall of Fame 1991. Aucune information de décès trouvée.	validee	\N	1948-10-25
208	Rodman	Dennis	Basketteur	1961	Américain(e)	Source : Wikipedia / Britannica — Notes : Aucune correction nécessaire, nom correctement orthographié.	validee	\N	1961-05-13
209	Nelson	Don	Basketteur / Entraîneur de basketball	1940	Américain(e)	Source : Wikipedia, NBA.com (Chuck Daly Lifetime Achievement Award 2025 remis en personne) — Notes : Ancien entraîneur NBA, recordman de victoires en carrière ; a reçu un prix en 2025 confirmant qu'il est vivant.	validee	\N	1940-05-15
210	Mureșan	Gheorghe	Basketteur	1971	Roumain(e) (naturalisé américain)	Source : Wikipedia, Basketball-Reference — Notes : Orthographe correcte : Mureșan (parfois écrit Muresan sans diacritique).	validee	\N	1971-02-14
211	Olajuwon	Hakeem	Basketteur	1963	Nigérian(e) (naturalisé américain en 1993)	Source : Wikipedia, Britannica, Basketball-Reference — Notes : Aucune correction nécessaire.	validee	\N	1963-01-21
212	Thomas	Isiah	Basketteur	1961	Américain(e)	Source : Wikipedia, RealGM — Notes : Faute de frappe corrigée : 'Isaih' -> 'Isiah'. Ambiguïté possible avec 'Isaiah Thomas' (né 1989, ex-Celtics) ; contexte (autres légendes NBA des années 80-90 : Rodman, Nelson, Olajuwon, Stockton) suggère fortement qu'il s'agit d'Isiah Thomas, la légende des Detroit Pistons né en 1961.	validee	\N	1961-04-30
213	Stockton	John	Basketteur	1962	Américain(e)	Source : Wikipedia, Britannica ; Mediamass (canular de décès démenti) — Notes : Une rumeur de décès a circulé (canular type 'celebrity death hoax'), confirmée fausse ; il est vivant.	validee	\N	1962-03-26
214	Erving	Julius	Basketteur	1950	Américain(e)	Source : Wikipedia / Basketball-Reference ; confirmé vivant (76 ans) par article Philadelphia Inquirer de février 2026 et présence à l'All-Star Game NBA 2026 — Notes : Surnom 'Dr. J'. Aucune faute de frappe à corriger, nom donné complet et correctement orthographié.	validee	\N	1950-02-22
215	Abdul-Jabbar	Kareem	Basketteur	1947	Américain(e)	Source : Wikipedia / Basketball-Reference ; confirmé vivant et actif publiquement via déclarations récentes (2026) sur LeBron James et prix NBA Social Justice — Notes : Seule correction : mise en majuscule du prénom 'Kareem' (saisi en minuscule dans le tableur).	validee	\N	1947-04-16
216	Malone	Karl	Basketteur	1963	Américain(e)	Source : Wikipedia / Basketball-Reference ; un canular de décès datant d'avril 2026 a circulé mais a été formellement démenti (Mediamass et autres sources confirment qu'il est vivant, 62 ans) — Notes : Un death hoax (canular) a circulé en 2026 mais est infirmé par plusieurs sources. Aucune faute de frappe dans le nom saisi.	validee	\N	1963-07-24
217	Bird	Larry	Basketteur	1956	Américain(e)	Source : Wikipedia / Basketball-Reference ; de fausses rumeurs de décès ont circulé en juin 2026 mais ont été démenties par ses représentants, apparition publique confirmée le 12 mai 2026 (conférence de presse des Pacers) — Notes : Un canular de décès a circulé en juin 2026, formellement démenti. Nom saisi sans faute.	validee	\N	1956-12-07
218	James	LeBron	Basketteur	1984	Américain(e)	Source : Wikipedia / ESPN / NBA.com ; actualité de juillet 2026 sur son départ des Lakers en free agency confirme qu'il est actif et vivant — Notes : Correction de casse : 'Lebron' -> 'LeBron' (orthographe officielle avec majuscule interne).	validee	\N	1984-12-30
219	Johnson	Earvin "Magic"	Basketteur	1959	Américain(e)	Source : Wikipedia ; actualités 2026 (Dean Smith Award, Grand Marshal Rose Parade, discours universitaires) confirment qu'il est vivant et actif — Notes : Vrai prénom Earvin, 'Magic' est un surnom utilisé comme nom d'usage courant.	validee	\N	1959-08-14
220	Morant	Ja	Basketteur	1999	Américain(e)	Source : Wikipedia / ESPN ; actualité de fin juin 2026 sur son transfert des Grizzlies vers les Trail Blazers confirme qu'il est actif et vivant (26 ans) — Notes : Correction de casse uniquement : 'ja morant' -> 'Ja Morant'. Récemment transféré de Memphis à Portland (juin 2026).	validee	\N	1999-08-10
221	Jordan	Michael	Basketteur/Basketteuse	1963	Américain(e)	Source : Wikipedia; actualités 2026 (Forbes, 23XI Racing Daytona 500) confirmant qu'il est en vie malgré un canular de décès circulant en juin 2026 — Notes : Nom sans ambiguïté. Un canular de mort a circulé en juin 2026 mais confirmé faux.	validee	\N	1963-02-17
222	Robertson	Oscar	Basketteur/Basketteuse	1938	Américain(e)	Source : Wikipedia, Basketball-Reference, Hall of Fame; mention indirecte dans article NBA de janvier 2026 (Russell Westbrook le dépasse au classement des passes/points meneurs) ne suggérant aucun décès — Notes : Aucune source récente ne confirme explicitement son état de santé en 2026, mais aucune annonce de décès trouvée; il est régulièrement cité dans l'actualité NBA de 2026 comme personnage vivant (comparaisons statistiques).	validee	\N	1938-11-24
223	Westbrook	Russell	Basketteur/Basketteuse	1988	Américain(e)	Source : ESPN, NBA.com, actualités juin 2026 (Sacramento Kings, investissement stade OKC) — Notes : Actif en NBA (Sacramento Kings) en 2026, blessé au pied en fin de saison mais bien vivant.	validee	\N	1988-11-12
224	Pippen	Scottie	Basketteur/Basketteuse	1965	Américain(e)	Source : ESPN, Instagram officiel (post janvier 2026), Sotheby's (vente de mémorabilia 2026) — Notes : Actif publiquement en 2026 (tournée 'No Bull', vente aux enchères, réseaux sociaux).	validee	\N	1965-09-25
225	O'Neal	Shaquille	Basketteur/Basketteuse	1972	Américain(e)	Source : Variety, LSU.edu, Olympics.com, Bloomberg (actualités 2026) — Notes : Très actif médiatiquement en 2026 (JO d'hiver, LSU, projet Dunkman, Archie Comics).	validee	\N	1972-03-06
226	Duncan	Tim	Basketteur/Basketteuse	1976	Américain(e)	Source : Wikipedia, Basketball-Reference; articles 2026 sur les NBA Finals Spurs évoquant son héritage — Notes : Attention: un homonyme 'Tim Duncan' fondateur de Talos Energy apparaît dans les résultats (secteur pétrolier) - personne différente, non retenue. Le basketteur est évoqué en 2026 dans le contexte des NBA Finals Spurs vs Knicks.	validee	\N	1976-04-25
227	Reno	Jean	Acteur/Actrice	1948	Français(e)	Source : AlloCiné, ICI.fr (actualité municipales 2026), TPA.fr (retour au théâtre) — Notes : Actif en 2026: tournée théâtrale au Japon, spectacle 'Le Chameau' à Paris, plusieurs films en tournage; ne se représente pas comme adjoint aux Baux-de-Provence (77 ans).	validee	\N	1948-07-30
228	Frazier	Walt (Walter II)	Basketteur	1945	Américain(e)	Source : Wikipedia / Basketball-Reference / NBA.com — Notes : Ancien joueur des New York Knicks, Hall of Fame, aujourd'hui commentateur pour MSG Network. Aucun doute sur l'identité.	validee	\N	1945-03-29
229	Iverson	Allen	Basketteur	1975	Américain(e)	Source : Wikipedia / Basketball-Reference — Notes : Ancien joueur NBA (Philadelphia 76ers), Hall of Fame 2016, actif dans des activités business en 2026.	validee	\N	1975-06-07
230	Assange	Julian	Journaliste/Lanceur d'alerte (fondateur de WikiLeaks)	1971	Australien(ne)	Source : Wikipedia / Britannica / Al Jazeera — Notes : Libéré en juin 2024 après un accord de plaidoyer, vit désormais librement en Australie.	validee	\N	1971-07-03
231	Borg	Björn	Joueur de tennis	1956	Suédois(e)	Source : ATP Tour / ESPN / Cancer Health — Notes : A révélé en 2024 un cancer de la prostate agressif, opéré en février 2024, en rémission selon des articles plus récents (2025-2026).	validee	\N	1956-06-06
232	al-Assad	Asma	Personnalité politique (ex-Première dame de Syrie)	1975	Britannico-syrienne	Source : Wikipedia (Asma al-Assad) ; Times of Israël (fr) sur diagnostic de leucémie ; Arab News / OpenSanctions pour actualité 2026 (sanctions, interview) — Notes : Née Asma Akhras à Londres, épouse de l'ex-président syrien Bachar al-Assad. Sanctionnée internationalement en 2026 (gel d'actifs Monaco, exclusions marchés publics US) et visée par une procédure judiciaire ouverte le 26/04/2026 à Damas. Des articles évoquent un diagnostic de leucémie antérieur ; son état de santé exact n'est pas confirmé publiquement en détail, mais elle a donné une interview récente en 2026, ce qui indique qu'elle est vivante.	validee	\N	1975-08-11
233	Mountbatten-Windsor	Charles III (Charles Philip Arthur George)	Chef d'État / Monarque	1948	Britannique	Source : ABC News, NBC News, E! Online (annonces de réduction du traitement anticancéreux en 2026) ; actualité royale du 2 juillet 2026 (visite en Écosse) — Notes : Roi du Royaume-Uni depuis 2022. En traitement contre un cancer diagnostiqué en 2024 ; a annoncé début 2026 une réduction de son protocole de traitement suite à une bonne réponse clinique. Toujours en fonction et actif publiquement début juillet 2026.	validee	\N	1948-11-14
234	Netanyahou	Benyamin (Benjamin)	Homme politique (Premier ministre)	1949	Israélien	Source : Times of Israel, Democracy Now!, Haaretz (actualités du 1er-2 juillet 2026) — Notes : Toujours Premier ministre d'Israël début juillet 2026 ; s'est rendu au Liban sud le 1er juillet 2026. Des élections législatives sont prévues fin octobre 2026.	validee	\N	1949-10-21
235	Thunberg	Greta	Militante/Activiste écologiste	2003	Suédoise	Source : Al Jazeera (avril et juin 2026), Snopes (démenti d'une rumeur de cancer diffusée en mars 2026) — Notes : Une rumeur de diagnostic de glioblastome circulant en mars 2026 a été démentie comme fausse (deepfake/désinformation) par Snopes. Elle reste active publiquement (manifestations pro-Palestine, critiques de Trump) jusqu'en juin 2026.	validee	\N	2003-01-03
236	Skinner	Dennis (Edward)	Homme politique (ancien député)	1932	Britannique	Source : Wikipedia (Dennis Skinner), TheyWorkForYou — Notes : Ancien député travailliste de Bolsover (1970-2019), surnommé 'The Beast of Bolsover'. Une fausse rumeur de décès avait circulé en septembre 2020. Aucune source consultée ne rapporte un décès depuis ; il aurait 94 ans en 2026, mais aucune confirmation explicite très récente de son statut n'a été trouvée, d'où une confiance moyenne plutôt que haute.	validee	\N	1932-02-11
237	Fabre	Denise	Animatrice TV	1942	Française	Source : Wikipedia (bio: speakerine TF1, ex-conseillère municipale de Nice) ; une annonce de décès du 24/03/2026 circulant sur des sites d'avis d'obsèques génériques (pfg.fr, deces-en-france.fr) semble concerner un homonyme et n'est corroborée par aucun média fiable — Notes : Ancienne speakerine de TF1 (1975-1992). Rumeur de décès non confirmée par une source fiable ; probable confusion avec une homonyme sur des registres d'avis de décès grand public. Date de naissance parfois donnée aussi comme 06/06/1942 selon les sites.	validee	\N	1942-09-05
238	Debout	Jean-Jacques	Chanteur/Auteur-compositeur	1940	Français	Source : Wikipedia ; mention d'une apparition publique (Cirque Bouglione, Pièces Jaunes) en janvier 2026 — Notes : Faute de frappe corrigée : DEBOIUT -> Debout. Époux de Chantal Goya.	validee	\N	1940-03-09
239	Biden	Joseph (Joe) Robinette	Homme politique	1942	Américain	Source : Wikipedia ; Full Fact, communiqués de son entourage (30 juin 2026) démentant une rumeur de décès — Notes : Ancien Président des États-Unis. Plusieurs canulars de décès ont circulé en 2026 (démentis officiellement) ; diagnostic connu de cancer de la prostate métastatique (annoncé en mai 2025), mais toujours en vie à la date de la recherche.	validee	\N	1942-11-20
240	Palmade	Pierre	Humoriste	1968	Français	Source : Wikipedia (condamné en novembre 2024 à 5 ans dont 2 ferme pour l'accident du 10/02/2023 ; assignation à résidence sous bracelet électronique depuis avril 2025)	validee	\N	1968-03-23
242	Guybet	Henri	Acteur	1936	Français	Source : Wikipedia (nommé chevalier de la Légion d'honneur en décembre 2023) ; Médiamass qualifie la rumeur de décès de fausse ('victime d'une rumeur') ; le site 'Nécropédia' annonçant un décès le 12/04/2026 est un générateur de nécrologies anticipées qui actualise automatiquement la date du jour, non une source d'actualité fiable — Notes : Faute de frappe corrigée : GUIYBET -> Guybet. Acteur des 'Aventures de Rabbi Jacob' et de '7e compagnie'. Une fausse annonce de décès circule (Nécropédia), mais aucun média fiable (AFP, Figaro, France Info) ne confirme un décès ; considéré vivant sur la base des sources disponibles.	validee	\N	1936-12-21
243	Maccione	Aldo	Acteur	1935	Italien	Source : Wikipedia/AlloCiné/Nanarland — Notes : Aucune mention de décès dans les sources encyclopédiques ; des pages Médiamass ('salaire le plus élevé', 'scandale') sont des contenus satiriques génériques sans valeur factuelle et ont été écartées.	validee	\N	1935-11-27
244	Adamo	Salvatore	Chanteur/Chanteuse	1943	Belge (d'origine italienne)	Source : Wikipedia (fr/en), Universal Music France — Notes : Des rumeurs de décès (mars 2025/2026, sites 'Nécropédia' et 'Médiamass') circulent régulièrement sur internet mais sont des nécrologies factices/canulars ; démenties par son entourage. Aucune source fiable ne confirme un décès.	validee	\N	1943-11-01
245	Vilard	Hervé	Chanteur/Chanteuse	1946	Français(e)	Source : Wikipedia, presse musicale française (Nostalgie, Universal Music) — Notes : Une rumeur de décès (février 2026, sites de canulars) a été démentie par son porte-parole. Connu pour 'Capri, c'est fini' (1965).	validee	\N	1946-07-24
246	Mathieu	Mireille	Chanteuse	1946	Française	Source : Wikipedia, site officiel mireillemathieu.com — Notes : Faute de frappe corrigée : 'Mireile' -> 'Mireille'. Toujours active, tournées prévues en 2025-2026.	validee	\N	1946-07-22
247	Castaldi	Jean-Pierre	Acteur	1944	Français(e)	Source : Wikipedia, AlloCiné, sites de billetterie (JDS.fr, L'Officiel des spectacles) confirmant une tournée théâtrale 'Monsieur Chasse' en 2026 — Notes : Une rumeur de décès infondée a circulé en avril/juin 2026 (sites générateurs de canulars 'Nécropédia' et 'Médiamass' donnant des dates contradictoires) ; les sources fiables et son actualité artistique (tournée 2026) confirment qu'il est vivant.	validee	\N	1944-10-01
248	Jacquet	Aimé	Ancien footballeur / sélectionneur de football	1941	Français(e)	Source : Wikipedia, Encyclopédie Universalis, Canal+ (consultant) — Notes : Rumeur de décès non fondée ayant circulé mi-juin 2026 (sites de canulars 'Nécropédia' vs 'Médiamass' qui la dément) ; célèbre pour avoir mené la France au titre de champion du monde 1998.	validee	\N	1941-11-27
249	Graham	Aubrey Drake	Rappeur/Chanteur	1986	Canadien(ne)	Source : Wikipedia, presse musicale (Music Times, DH/Les Sports+, Génération, juin 2026) — Notes : Connu sous le nom de scène 'Drake' (nom complet Aubrey Drake Graham). Actualité 2026 : sortie de plusieurs albums ('Iceman', 'Habibti', 'Maid of Honour') et forte actualité commerciale/streaming.	validee	\N	1986-10-24
250	Rothschild (de)	Nadine	Écrivaine / Personnalité mondaine (ex-actrice)	1932	Française	Source : Wikipedia (FR/EN), Fnac biographie — Notes : Née Nadine Lhopitalier, actrice sous le nom de Nadine Tallier avant son mariage en 1962 avec le baron Edmond de Rothschild. Aucune source fiable ne rapporte de décès ; aurait environ 94 ans en 2026.	validee	\N	1932-04-18
251	Boyer	Myriam	Actrice	1948	Française	Source : AlloCiné, IMDb — Notes : Aucune information de décès trouvée ; actrice toujours active dans les sources consultées.	validee	\N	1948-05-23
252	Marchand	Corinne	Actrice	1931	Française	Source : AlloCiné, IMDb, Wikipedia — Notes : Connue pour Cléo de 5 à 7 (1962). Aucune annonce de décès trouvée dans les sources consultées (ni sur les listes 'morts en 2026' de JeSuisMort.com) ; confiance medium car peu d'actualité récente sur elle.	validee	\N	1931-12-04
253	Scotti	Tony	Acteur / Producteur	1939	Américain(e)	Source : Wikipedia, Gala.fr — Notes : Acteur et producteur américain, cofondateur de Scotti Brothers Records, époux de Sylvie Vartan depuis 1984. Fêtait ses 86 ans en décembre 2025/annoncé comme vivant en avril 2026.	validee	\N	1939-12-22
254	Hopkins	Anthony (Philip Anthony Hopkins)	Acteur	1937	Britannique	Source : Wikipedia, IMDb, Mediamass (démenti de la rumeur de décès) — Notes : Une rumeur de décès (hoax) a circulé en mai 2026 mais a été démentie par ses représentants ; acteur toujours vivant, 88 ans.	validee	\N	1937-12-31
255	Hernandez	Gérard	Acteur	1933	Français(e) (d'origine espagnole)	Source : Wikipedia EN, Mediamass (démenti rumeur de décès) — Notes : Acteur connu notamment pour Scènes de ménages. Une source de type nécrologie anticipée (Nécropédia, site non fiable générant des notices avant décès) indique une mort le 23/02/2026, mais Mediamass qualifie cela de rumeur/hoax démentie par son entourage. Aucune source de presse fiable ne confirme le décès ; à vérifier avec une source d'actualité de confiance.	validee	\N	1933-01-20
256	Lelouch	Claude	Réalisateur	1937	Français(e)	Source : Wikipedia / linternaute.fr / ecranlarge.com — Notes : Aucune faute de frappe à corriger, nom identifié directement. Réalisateur français né le 30/10/1937, connu pour 'Un homme et une femme' (1966), fondateur des Ateliers du Cinéma à Beaune. Aucune source n'indique un décès.	validee	\N	1937-10-30
\.


--
-- TOC entry 3516 (class 0 OID 16428)
-- Dependencies: 218
-- Data for Name: deathPerson; Type: TABLE DATA; Schema: public; Owner: dc_user
--

COPY public."deathPerson" (id, nom, prenom, categorie, date_naissance, date_deces, nationalite, a_verifier, statut, created_by, alive_person_id) FROM stdin;
1	Boudard	Alphonse	Écrivain/Écrivaine	1925-12-17	2000-01-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
2	Autant-Lara	Claude	Réalisateur/Réalisatrice	1901-08-05	2000-02-05	Français	\N	validee	\N	\N
3	Gisèle	\N	Autre	1908-12-19	2000-03-30	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
4	Rampal	Jean-Pierre	Musicien/Musicienne	1922-01-07	2000-05-20	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
5	Coutteure	Ronny	Autre	1951-07-02	2000-06-21	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
6	Montero	Germaine	Acteur/Actrice	1909-10-22	2000-06-29	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
7	Matthau	Walter	Acteur/Actrice	1920-10-01	2000-07-01	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
8	Sautet	Claude	Réalisateur/Réalisatrice	1924-02-23	2000-07-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
9	Derlich	Didier	Musicien/Musicienne	1965-04-22	2000-08-04	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
10	Lebovici	Serge	Médecin	1915-06-10	2000-08-11	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
11	Carzou	Jean	Peintre/Sculpteur	1907-01-01	2000-08-12	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
12	Mestral	Armand	Acteur/Actrice	1917-11-25	2000-09-17	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
13	Kaya	Ahmet	Chanteur/Chanteuse	1957-10-28	2000-11-16	Turque	\N	validee	\N	\N
14	Goddet	Jacques	Cycliste	1905-06-21	2000-12-15	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
15	Gordon	Leo	Acteur/Actrice	1922-12-02	2000-12-26	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
16	Tréjan	Guy	Chanteur/Chanteuse	1921-09-18	2001-01-25	Français	\N	validee	\N	\N
17	Davy	Jean	Acteur/Actrice	1911-10-15	2001-02-05	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
18	Enrico	Gino Robert	Réalisateur/Réalisatrice	1931-04-13	2001-02-23	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
19	Lindon	Jérôme	Editeur	1925-06-09	2001-04-09	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
20	Fredericks	Carole Denise	Chanteur/Chanteuse	1952-06-05	2001-06-07	Américaine	\N	validee	\N	\N
21	Aleka	Henri	Autre	1909-02-10	2001-06-15	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
22	Greer	Jane	Acteur/Actrice	1924-09-09	2001-08-24	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
23	Léotard	Philippe	Acteur/Actrice	1940-08-28	2001-08-25	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
24	Aaliyah	\N	Chanteur/Chanteuse	1979-01-16	2001-08-25	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
25	Chiappe	Jean-François	Acteur/Actrice	1931-11-30	2001-10-21	Français	\N	validee	\N	\N
26	Cavagnoud	Régine	Alpiniste/Skieur	1970-06-27	2001-10-31	Français	\N	validee	\N	\N
27	Bécaud	Gilbert	Chanteur/Chanteuse	1927-10-24	2001-12-18	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
28	Verneuil	Henri	Réalisateur/Réalisatrice	1920-10-15	2002-01-11	Français	\N	validee	\N	\N
29	Lee	Peggy	Chanteur/Chanteuse	1920-05-26	2002-01-21	Américaine	\N	validee	\N	\N
30	Bourdieu	Pierre	Sociologue/Philosophe	1930-08-01	2002-01-23	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
31	Vedel	Georges	Acteur/Actrice	1910-07-05	2002-02-21	Français	\N	validee	\N	\N
32	Wilder	Billy	Réalisateur/Réalisatrice	1906-06-22	2002-03-27	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
33	Lemarque	Francis	Chanteur/Chanteuse	1917-11-25	2002-04-20	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
34	Robert	Yves	Réalisateur/Réalisatrice	1920-06-19	2002-05-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
35	Malclès	Jean-Denis	Decorateur (theatre/cinema)	1912-01-15	2002-05-30	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
36	Périer	François	Acteur/Actrice	1919-11-10	2002-06-28	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
37	Brown	Ray	Musicien/Musicienne	1926-10-13	2002-07-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
38	Daniel-Lesur	\N	Musicien/Musicienne	1908-11-19	2002-07-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
39	Cassan	Lionel	Autre	1956-06-17	2002-08-18	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
40	Dupuis	Charles	Editeur (BD)	1918-06-10	2002-11-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
41	Coburn	James	Réalisateur/Réalisatrice	1928-08-31	2002-11-18	Américain	\N	validee	\N	\N
42	Gélin	Daniel	Réalisateur/Réalisatrice	1921-05-19	2002-11-29	Française	\N	validee	\N	\N
43	Marnay	Eddy	Parolier (chanson)	1920-12-18	2003-01-03	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
44	Pialat	Maurice	Réalisateur/Réalisatrice	1925-08-31	2003-01-11	Français	\N	validee	\N	\N
45	Lefel	Edith	Chanteur/Chanteuse	1963-11-17	2003-01-20	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
46	Krasucki	Henri	Militaire	1924-09-02	2003-01-24	Allemande	\N	validee	\N	\N
47	Pécas	Max	Réalisateur/Réalisatrice	1925-04-25	2003-02-10	Français	\N	validee	\N	\N
48	plantier	Daniel Toscan du	Réalisateur/Réalisatrice	1941-04-07	2003-02-11	Français	\N	validee	\N	\N
49	Rheims	Maurice	Écrivain/Écrivaine	1910-01-04	2003-03-06	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
50	Bourin	Jeanne	Réalisateur/Réalisatrice	1922-01-13	2003-03-19	Française	\N	validee	\N	\N
51	Yanne	Jean	Acteur/Actrice	1933-07-18	2003-05-23	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
52	hepburn	Katharine Houghton	Acteur/Actrice	1907-05-12	2003-06-29	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
53	Plante	Jacques	Journaliste	\N	2003-07-16	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement ; date de naissance inconnue sur la source	validee	\N	\N
54	Trintignant	Marie	Chanteur/Chanteuse	1962-01-21	2003-08-01	Française	\N	validee	\N	\N
55	Cash	Johnny	Chanteur/Chanteuse	1932-02-26	2003-09-12	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
56	Palmer	Robert	Chanteur/Chanteuse	1949-01-19	2003-09-26	Suisse	\N	validee	\N	\N
57	Schwartzenberg	Léon	Médecin	1923-12-02	2003-10-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
58	Nicot	Claude	Acteur/Actrice	1925-02-12	2003-11-17	Français	\N	validee	\N	\N
59	Daumier	Sophie	Chanteur/Chanteuse	1934-11-24	2004-01-01	Française	\N	validee	\N	\N
60	Cartwright	Lynn	Acteur/Actrice	1927-02-27	2004-01-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
61	Holgado	Ticky	Militaire	1944-06-24	2004-01-22	Française	\N	validee	\N	\N
62	Darrieu	Gérard	Acteur/Actrice	1925-09-11	2004-01-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
63	Métayer	Alex	Chanteur/Chanteuse	1930-03-19	2004-02-21	Français	\N	validee	\N	\N
64	Tcherina	Ludmila	Danseur/Danseuse	1924-10-10	2004-03-21	Russe	\N	validee	\N	\N
65	Roda-Gil	Etienne	Parolier (chanson)	1941-08-01	2004-05-28	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
66	Saint-cyr	Renée	Acteur/Actrice	1904-11-16	2004-07-11	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
67	Reggiani	Serge	Chanteur/Chanteuse	1922-05-02	2004-07-23	Français	\N	validee	\N	\N
68	Wray	Vina fay	Acteur/Actrice	1907-09-15	2004-08-08	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
69	Bellil	Samira	Écrivain/Écrivaine	1972-11-24	2004-09-04	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
70	Bluebell	Miss	Danseur/Danseuse	1910-06-24	2004-09-11	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
71	Ramone	Johnny	Musicien/Musicienne	1948-10-08	2004-09-15	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
72	Gassler	Géraldine	Acteur/Actrice	1968-05-17	2004-11-01	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
73	Dynam	Jacques	Réalisateur/Réalisatrice	1923-12-30	2004-11-11	Français	\N	validee	\N	\N
74	Broca	Philippe de	Réalisateur/Réalisatrice	1933-03-15	2004-11-26	Français	\N	validee	\N	\N
75	Verny	Françoise	Militaire	1928-11-26	2004-12-14	Française	\N	validee	\N	\N
76	Sontag	Susan	Écrivain/Écrivaine	1933-01-16	2004-12-28	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
77	Orbach	Jerry	Chanteur/Chanteuse	1935-10-20	2004-12-28	Américain	\N	validee	\N	\N
78	Daninos	Pierre	Humoriste	1913-05-26	2005-01-07	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
79	Joubert	Jacqueline	Réalisateur/Réalisatrice	1921-03-29	2005-01-08	Française	\N	validee	\N	\N
80	Choron	Professeur	Acteur/Actrice	1929-09-21	2005-01-10	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
81	Villeret	Jacques	Réalisateur/Réalisatrice	1951-02-06	2005-01-28	Français	\N	validee	\N	\N
82	Bachelet	Pierre	Chanteur/Chanteuse	1944-05-25	2005-02-15	Française	\N	validee	\N	\N
83	Balsan	Humbert	Producteur/Productrice	1954-08-21	2005-02-17	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
84	II	Jean-Paul	Religieux	1920-05-18	2005-04-02	Français	\N	validee	\N	\N
85	Barclay	Eddie	Producteur/Productrice	1921-01-21	2005-05-13	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
86	Simon	Claude	Écrivain/Écrivaine	1913-10-10	2005-07-06	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
87	Bunker	Edward	Écrivain/Écrivaine	1933-12-31	2005-07-19	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
88	Buffet	Annabel	Chanteur/Chanteuse	1928-05-10	2005-08-03	Américain	\N	validee	\N	\N
89	Adams	Don	Acteur/Actrice	1923-04-13	2005-09-25	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
90	Folon	Jean-Michel	Peintre/Sculpteur	1934-03-01	2005-10-20	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
91	Arman	\N	Musicien/Musicienne	1928-11-17	2005-10-22	Français	\N	validee	\N	\N
92	Parks	Rosa	Militant(e)	1913-02-04	2005-10-24	Américain	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer	validee	\N	\N
93	Faizant	Jacques	Dessinateur BD	1918-10-30	2006-01-14	Français	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer	validee	\N	\N
94	Olive	\N	Musicien/Musicienne	1955-12-04	2006-01-17	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
95	Ipoustéguy	Jean-Robert	Peintre/Sculpteur	1920-01-06	2006-02-08	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
96	Cowl	Darry	Musicien/Musicienne	1925-08-27	2006-02-14	Français	\N	validee	\N	\N
97	Mcgavin	Darren	Acteur/Actrice	1922-05-07	2006-02-25	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
98	René	Lasserre	Cuisinier/Cuisiniere	1912-11-12	2006-03-15	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
99	Legras	Jacques	Réalisateur/Réalisatrice	1923-10-25	2006-03-15	Français	\N	validee	\N	\N
100	Rialet	Daniel	Acteur/Actrice	1960-02-01	2006-04-11	Français	\N	validee	\N	\N
101	Castelli	Philippe	Acteur/Actrice	1925-06-08	2006-04-16	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
102	Revel	Jean-François	Sociologue/Philosophe	1924-01-19	2006-04-30	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
103	Appel	Karel	Peintre/Sculpteur	1921-04-25	2006-05-03	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
104	Meynier	Max	Animateur/Animatrice TV-Radio	1938-01-30	2006-05-06	Française	\N	validee	\N	\N
105	Piéplu	Claude Léon Auguste	Acteur/Actrice	1923-05-09	2006-05-24	Français	\N	validee	\N	\N
106	Devos	Raymond	Musicien/Musicienne	1922-11-09	2006-06-15	Français	\N	validee	\N	\N
107	Séchan	Olivier	Écrivain/Écrivaine	1911-01-14	2006-07-07	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
108	Oury	Gérard	Musicien/Musicienne	1919-04-29	2006-07-20	Française	\N	validee	\N	\N
109	Brach	Gérard	Scénariste	1927-07-23	2006-09-09	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
110	Aumont	Tina	Réalisateur/Réalisatrice	1946-02-14	2006-10-28	Américaine	\N	validee	\N	\N
111	Frank	Bernard	Écrivain/Écrivaine	1929-10-11	2006-11-03	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
112	Girod	Francis	Musicien/Musicienne	1944-10-09	2006-11-19	Français	\N	validee	\N	\N
113	Noiret	Philippe	Réalisateur/Réalisatrice	1930-10-01	2006-11-23	Français	\N	validee	\N	\N
114	Brabant	Charles	Réalisateur/Réalisatrice	1920-07-06	2006-11-28	Français	\N	validee	\N	\N
115	Jade	Claude	Réalisateur/Réalisatrice	1948-10-08	2006-12-01	Française	\N	validee	\N	\N
116	Brown	James	Chanteur/Chanteuse	1933-05-03	2006-12-25	Américaine	\N	validee	\N	\N
117	Carrière	Anne-Marie	Chanteur/Chanteuse	1925-01-16	2006-12-29	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
118	Vernant	Jean-Pierre	Historien	1914-01-04	2007-01-09	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
119	Bézu	\N	Chanteur/Chanteuse	1943-07-24	2007-02-03	Français	\N	validee	\N	\N
120	Troyat	Henri	Écrivain/Écrivaine	1911-11-01	2007-03-02	Français	\N	validee	\N	\N
121	Baudrillard	Jean	Sociologue/Philosophe	1929-07-27	2007-03-06	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
122	Aubrac	Lucie	Journaliste	1912-06-29	2007-03-14	Française	\N	validee	\N	\N
123	Clarins	Jacques Courtin	Entrepreneur/Chef d'entreprise	1921-08-06	2007-03-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
124	Rémond	René	Historien	1918-09-30	2007-04-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
125	Aminel	Georges	Acteur/Actrice	1922-10-11	2007-04-29	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
126	Lemarchal	Grégory	Chanteur/Chanteuse	1983-05-13	2007-04-30	Français	\N	validee	\N	\N
127	Gennes	Pierre-Gilles De	Scientifique	1932-10-24	2007-05-18	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
128	Brialy	Jean-claude	Acteur/Actrice	1933-03-30	2007-05-30	Française	\N	validee	\N	\N
129	Brosset	Claude	Acteur/Actrice	1943-12-24	2007-06-25	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
130	Serrault	Michel Lucien	Acteur/Actrice	1928-01-24	2007-07-29	Français	\N	validee	\N	\N
131	Rédélé	Jean	Entrepreneur/Chef d'entreprise	1922-05-17	2007-08-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
132	Barre	Raymond	Homme/Femme politique	1924-04-12	2007-08-25	Français	\N	validee	\N	\N
133	Martin	Jacques	Animateur/Animatrice TV-Radio	1933-06-22	2007-09-14	Français	\N	validee	\N	\N
134	Marceau	Marcel	Mime	1923-03-22	2007-09-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
135	Rollis	Robert	Acteur/Actrice	1921-03-14	2007-11-06	Français	\N	validee	\N	\N
136	Chichin	Frédéric	Musicien/Musicienne	1954-05-01	2007-11-28	Français	\N	validee	\N	\N
137	Bhutto	Benazir	Homme/Femme politique	1953-06-21	2007-12-27	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
138	Paris	Alexandre De	Acteur/Actrice	1922-09-06	2008-01-03	Française	\N	validee	\N	\N
139	Nurmi	Maila	Acteur/Actrice	1922-12-21	2008-01-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
140	Feydeau	Alain	Autre	1934-07-21	2008-01-14	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
141	Carlos	\N	Chanteur/Chanteuse	1943-02-20	2008-01-17	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
142	Khorsand	Philippe	Acteur/Actrice	1948-02-17	2008-01-29	Français	\N	validee	\N	\N
143	Niane	Katoucha	Animateur/Animatrice TV-Radio	1960-10-23	2008-02-01	Sénégalaise	\N	validee	\N	\N
144	Salvador	Henri	Chanteur/Chanteuse	1917-07-18	2008-02-13	Français	\N	validee	\N	\N
145	Cadinot	Jean-Daniel	Réalisateur/Réalisatrice	1944-02-10	2008-04-23	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
146	Fersen	Christine	Acteur/Actrice	1944-03-05	2008-05-26	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
147	Cossery	Albert	Écrivain/Écrivaine	1913-11-03	2008-06-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
148	Getty	Estelle	Acteur/Actrice	1923-07-25	2008-07-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
149	Frémy	Dominique	Journaliste	1931-05-05	2008-10-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
150	Emmanuelle	Soeur	Religieux	1908-11-16	2008-10-20	Belge	\N	validee	\N	\N
151	Sumac	Yma	Chanteur/Chanteuse	1922-09-13	2008-11-01	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
152	Caradec	François	Écrivain/Écrivaine	1924-06-18	2008-11-13	Français	\N	validee	\N	\N
153	Fechner	Christian	Chanteur/Chanteuse	1944-07-26	2008-11-26	Français	\N	validee	\N	\N
154	Ackerman	Forrest James	Acteur/Actrice	1916-11-24	2008-12-04	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
155	Lauzier	Gérard	Dessinateur BD	1932-11-30	2008-12-06	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
156	Tappert	Horst	Acteur/Actrice	1923-05-26	2008-12-13	Allemande	\N	validee	\N	\N
157	Savage	Ann	Acteur/Actrice	1921-02-19	2008-12-25	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
158	Lapidus	Ted	Acteur/Actrice	1929-06-23	2008-12-29	Français	\N	validee	\N	\N
159	Cravenne	Georges	Producteur/Productrice	1914-01-24	2009-01-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
160	Berri	Claude	Réalisateur/Réalisatrice	1934-07-01	2009-01-12	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
161	Montalbán	Ricardo	Acteur/Actrice	1920-11-25	2009-01-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
162	Blanc	Gérard	Chanteur/Chanteuse	1947-12-08	2009-01-24	Français	\N	validee	\N	\N
163	Barillé	Albert	Réalisateur/Réalisatrice	1920-02-14	2009-02-05	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
164	Vilers	Vania	Réalisateur/Réalisatrice	1938-06-12	2009-02-22	Français	\N	validee	\N	\N
165	Castagnou	Pierre	Homme/Femme politique	1940-09-08	2009-02-24	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
166	François	Jacqueline	Chanteur/Chanteuse	1922-01-30	2009-03-07	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
167	Bourgeade	Pierre	Écrivain/Écrivaine	1927-11-07	2009-03-12	Français	\N	validee	\N	\N
168	Bashung	Alain	Chanteur/Chanteuse	1947-12-01	2009-03-14	Français	\N	validee	\N	\N
169	Bourges	Yvon	Homme/Femme politique	1921-06-29	2009-04-18	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
170	Leuvrais	Jean	Acteur/Actrice	1925-08-16	2009-04-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
171	Ravanel	Serge	Militaire	1920-05-12	2009-04-27	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
172	Planchon	Roger	Metteur en scene (theatre)	1931-09-12	2009-05-12	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
173	Carradine	David	Acteur/Actrice	1936-12-08	2009-06-03	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
174	Jackson	Michael	Chanteur/Chanteuse	1958-08-29	2009-06-25	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
175	Belmadi	Yasmine	Acteur/Actrice	1976-01-26	2009-07-18	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
176	Falcon	André	Acteur/Actrice	1924-11-28	2009-07-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
177	Taittinger	Pierre-Christian	Homme/Femme politique	1926-02-05	2009-09-27	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
178	Doris	Pierre	Acteur/Actrice	1919-10-29	2009-10-27	Français	\N	validee	\N	\N
179	Quivrin	Jocelyn	Réalisateur/Réalisatrice	1979-02-14	2009-11-15	Français	\N	validee	\N	\N
180	Lebas	Renée	Chanteur/Chanteuse	1917-04-23	2009-12-18	Française	\N	validee	\N	\N
181	Murphy	Brittany	Rappeur/Rappeuse	1977-11-10	2009-12-20	Américaine	\N	validee	\N	\N
182	Rocher	Yves	Militaire	1930-04-07	2009-12-26	Français	\N	validee	\N	\N
183	Solo	Mano	Chanteur/Chanteuse	1963-04-24	2010-01-10	Français	\N	validee	\N	\N
184	Schérer	Maurice henri joseph	Réalisateur/Réalisatrice	1920-03-21	2010-01-11	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
185	Rohmer	Éric	Réalisateur/Réalisatrice	1920-03-21	2010-01-11	Français	\N	validee	\N	\N
186	Bensaïd	Daniel	Sociologue/Philosophe	1946-03-25	2010-01-12	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
187	Pierre	Roger	Acteur/Actrice	1923-08-30	2010-01-23	Français	\N	validee	\N	\N
188	Marseille	Jacques	Historien	1945-10-15	2010-03-04	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
189	Topaloff	Patrick	Chanteur/Chanteuse	1944-12-30	2010-03-07	Russe	\N	validee	\N	\N
190	Duboc	Odile	Danseur/Danseuse	1941-07-23	2010-04-22	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
191	Dio	Ronnie James	Musicien/Musicienne	1942-07-10	2010-05-16	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
192	Sarcey	Martine	Acteur/Actrice	1928-09-28	2010-06-11	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
193	Terzieff	Laurent	Acteur/Actrice	1935-06-27	2010-07-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
194	Aubry	Cécile	Acteur/Actrice	1928-08-03	2010-07-19	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
195	Cremer	Bruno	Acteur/Actrice	1929-10-06	2010-08-07	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
196	Cauvin	Patrick	Écrivain/Écrivaine	1932-10-06	2010-08-13	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
197	Corneau	Alain	Réalisateur/Réalisatrice	1943-08-07	2010-08-29	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
198	Fignon	Laurent	Cycliste	1960-08-12	2010-08-31	Français	\N	validee	\N	\N
199	Chabrol	Claude	Réalisateur/Réalisatrice	1930-06-24	2010-09-12	Française	\N	validee	\N	\N
200	Burke	Solomon	Musicien/Musicienne	1940-03-21	2010-10-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
201	Berliner	Gérard	Chanteur/Chanteuse	1956-01-05	2010-10-13	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
202	Bosley	Tom	Musicien/Musicienne	1927-10-01	2010-10-19	Américain	\N	validee	\N	\N
203	Musson	Bernard Claude	Acteur/Actrice	1925-02-22	2010-10-29	Français	\N	validee	\N	\N
204	Caro	Isabelle	Chanteur/Chanteuse	1982-09-12	2010-11-17	Suisse	\N	validee	\N	\N
205	Nielsen	Leslie William	Acteur/Actrice	1926-02-11	2010-11-28	Canadien	\N	validee	\N	\N
206	Rollin	Jean	Réalisateur/Réalisatrice	1938-11-03	2010-12-15	Français	\N	validee	\N	\N
207	Farrell	Bobby	Chanteur/Chanteuse	1949-10-06	2010-12-30	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
208	Raisner	Albert	Animateur/Animatrice TV-Radio	1922-09-30	2011-01-01	Français	\N	validee	\N	\N
209	Dutourd	Jean Gwenael	Écrivain/Écrivaine	1920-01-14	2011-01-17	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
210	Valabrega	Jean-Paul	Autre	1922-06-21	2011-01-25	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
211	Chedid	Andrée	Réalisateur/Réalisatrice	1920-03-20	2011-02-06	Française	\N	validee	\N	\N
212	Girardot	Annie	Musicien/Musicienne	1931-10-25	2011-02-28	Française	\N	validee	\N	\N
213	Fortin	Michel Didier	Autre	1947-07-09	2011-03-15	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
214	Capello	Maître	Animateur/Animatrice TV-Radio	1922-12-19	2011-03-20	Français	\N	validee	\N	\N
215	Pisier	Marie-France	Acteur/Actrice	1944-05-10	2011-04-24	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
216	Rhodes	Jane	Musicien/Musicienne	1929-03-13	2011-05-07	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
217	Pagès	Évelyne	Acteur/Actrice	1942-02-25	2011-06-13	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
218	Falk	Peter	Acteur/Actrice	1927-09-16	2011-06-23	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
219	Petit	Roland	Danseur/Danseuse	1924-01-13	2011-07-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
220	Leprest	Allain	Chanteur/Chanteuse	1954-06-03	2011-08-15	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
221	Wheldon	Dan	Pilote (auto/moto)	1978-06-22	2011-10-16	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
222	Amadou	Jean	Acteur/Actrice	1292-10-01	2011-10-23	Française	\N	validee	\N	\N
223	Inchauspé	Michel	Homme/Femme politique	1925-11-05	2011-10-26	Français	\N	validee	\N	\N
224	Lamoureux	Robert	Réalisateur/Réalisatrice	1920-01-04	2011-10-29	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
225	Bessières	Louis	Musicien/Musicienne	1913-08-23	2011-11-22	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
226	Debary	Jacques	Acteur/Actrice	1914-11-25	2011-12-09	Française	\N	validee	\N	\N
227	Évora	Cesária	Chanteur/Chanteuse	1941-08-27	2011-12-17	Portugais	\N	validee	\N	\N
228	Jacquemin	\N	Journaliste	1913-10-24	2011-12-31	Française	\N	validee	\N	\N
229	Varte	Rosy	Réalisateur/Réalisatrice	1923-11-22	2012-01-14	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
230	Parély	Mila	Acteur/Actrice	1917-10-07	2012-01-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
231	Arditi	Georges	Acteur/Actrice	1914-12-14	2012-01-15	Français	\N	validee	\N	\N
232	Blachas	Christian	Journaliste	1946-06-16	2012-02-05	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
233	Houston	Whitney	Chanteur/Chanteuse	1963-08-09	2012-02-11	Américain	\N	validee	\N	\N
234	Desmarets	Sophie	Cycliste	1922-04-07	2012-02-13	Française	\N	validee	\N	\N
235	Duby	Jacques	Acteur/Actrice	1922-05-07	2012-02-15	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
236	Tornade	Pierre	Acteur/Actrice	1930-01-21	2012-03-07	Français	\N	validee	\N	\N
237	Marceau	Félicien	Écrivain/Écrivaine	1913-09-16	2012-03-07	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
238	Giraud	Jean Henri Gaston	Dessinateur BD	1938-05-08	2012-03-10	Français	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer	validee	\N	\N
239	Duchaussoy	Michel	Réalisateur/Réalisatrice	1938-11-29	2012-03-13	Française	\N	validee	\N	\N
240	Schoendoerffer	Pierre	Réalisateur/Réalisatrice	1928-05-05	2012-03-14	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
241	Moreno	Roland	Inventeur/Ingenieur	1945-06-11	2012-04-29	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
242	Charden	Eric	Chanteur/Chanteuse	1942-10-15	2012-04-29	Français	\N	validee	\N	\N
243	macias	Carlos Fuentes	Écrivain/Écrivaine	1928-11-11	2012-05-15	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
244	Summer	Donna	Chanteur/Chanteuse	1948-12-31	2012-05-17	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
245	Bradbury	Ray	Écrivain/Écrivaine	1920-08-22	2012-06-05	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
246	Mathieu	George Victor	Peintre/Sculpteur	1921-01-27	2012-06-10	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
247	Bianciotti	Hector	Écrivain/Écrivaine	1930-03-18	2012-06-12	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
248	Roland	Thierry José	Athlète	1937-08-04	2012-06-16	Française	\N	validee	\N	\N
249	Sabatier	Robert	Écrivain/Écrivaine	1923-08-17	2012-06-28	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
250	Ferrand	Olivier	Homme/Femme politique	1969-11-08	2012-06-30	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
251	Chevit	Maurice	Acteur/Actrice	1923-10-31	2012-07-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
252	Chelton	Tsilla	Acteur/Actrice	1919-07-21	2012-07-15	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
253	Delarue	Jean-Luc	Animateur/Animatrice TV-Radio	1964-06-24	2012-08-23	Français	\N	validee	\N	\N
254	Duncan	Michael Clarke	Acteur/Actrice	1957-12-10	2012-09-03	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
255	Mondy	Pierre	Réalisateur/Réalisatrice	1925-02-10	2012-09-15	Français	\N	validee	\N	\N
256	Pinoteau	Claude	Réalisateur/Réalisatrice	1925-05-25	2012-10-05	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
257	Alamo	Frank	Animateur/Animatrice TV-Radio	1941-10-12	2012-10-11	Français	\N	validee	\N	\N
258	Kristel	Sylvia	Réalisateur/Réalisatrice	1952-09-28	2012-10-17	Néerlandaise	\N	validee	\N	\N
259	Pavon	Pépito	Footballeur/Footballeuse	1941-02-12	2012-10-17	Espagnol	\N	validee	\N	\N
260	Fransined	\N	Chanteur/Chanteuse	1914-10-21	2012-10-17	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
261	PAYEN	Roger	Autre	1913-01-13	2012-11-12	Français	Categorie non detectee automatiquement dans la biographie - a verifier manuellement	validee	\N	\N
262	Blèze	Jean-Louis	Chanteur/Chanteuse	1927-08-01	2012-12-24	Français	\N	validee	\N	\N
263	Topart	Jean pierre camille henri	Acteur/Actrice	1922-04-13	2012-12-29	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
264	Lefrèvre-Pontalis	Jean-Bertrand	Écrivain/Écrivaine	1924-01-15	2013-01-15	Français	\N	validee	\N	\N
265	Scoff	Alain	Humoriste	1940-12-01	2013-01-20	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
266	Alain	Marie-Claire	Musicien/Musicienne	1926-08-10	2013-02-26	Française	\N	validee	\N	\N
267	Stéphane	Hessel	Écrivain/Écrivaine	1917-10-20	2013-02-27	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
268	Darc	Daniel	Chanteur/Chanteuse	1959-05-20	2013-02-28	Français	\N	validee	\N	\N
269	Savary	Jérôme	Musicien/Musicienne	1942-06-27	2013-03-04	Argentine	\N	validee	\N	\N
270	Bonnet	Franck-Olivier	Autre	1946-06-21	2013-03-25	\N	Categorie non detectee automatiquement dans la biographie - a verifier manuellement ; nationalite non detectee automatiquement	validee	\N	\N
271	Fred	\N	Dessinateur BD	1931-03-05	2013-04-02	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
272	Wou-Ki	Zao	Peintre/Sculpteur	1921-02-13	2013-04-09	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
273	Moustaki	Georges	Chanteur/Chanteuse	1934-05-03	2013-05-23	\N	Categorie deduite des connaissances generales (absente de la biographie du site) - a confirmer ; nationalite non detectee automatiquement	validee	\N	\N
274	Lewis	Jerry	Chanteur/Chanteuse	1926-03-16	2017-08-20	Américain	\N	validee	\N	\N
275	Hallyday	Johnny	Chanteur/Chanteuse	1943-06-15	2017-12-05	Français	\N	validee	\N	\N
276	Gall	France	Rugbyman/Rugbywoman	1947-10-09	2018-01-07	Française	\N	validee	\N	\N
277	Bocuse	Paul	Homme/Femme politique	1926-02-11	2018-01-20	Française	\N	validee	\N	\N
278	Laurens	Rose	Chanteur/Chanteuse	1951-03-04	2018-04-29	Française	\N	validee	\N	\N
279	Maurane	\N	Chanteur/Chanteuse	1960-11-12	2018-05-07	Belge	\N	validee	\N	\N
280	Bellemare	Pierre	Chanteur/Chanteuse	1929-10-21	2018-05-26	Français	\N	validee	\N	\N
281	Horner	Yvette	Footballeur/Footballeuse	1922-09-22	2018-06-11	Française	\N	validee	\N	\N
282	Corbier	François	Chanteur/Chanteuse	1944-10-17	2018-07-01	\N	Nationalite non detectee automatiquement - a completer	validee	\N	\N
283	Aznavour	Charles	Chanteur/Chanteuse	1924-05-22	2018-10-01	Français	\N	validee	\N	\N
284	Gildas	Philippe	Sportif/Sportive (autre)	1935-11-12	2018-10-28	Grec	\N	validee	\N	\N
285	Pacôme	Maria	Acteur/Actrice	1923-07-18	2018-12-01	Française	\N	validee	\N	\N
286	Anémone	\N	Acteur/Actrice	1950-08-09	2019-04-30	Française	\N	validee	\N	\N
287	Clegg	Johnny	Musicien/Musicienne	1953-06-07	2019-07-16	Polonais	\N	validee	\N	\N
288	Carletti	Ariane	Chanteur/Chanteuse	1957-11-04	2019-09-03	Française	\N	validee	\N	\N
289	Poulidor	Raymond	Cycliste	1936-04-15	2019-11-19	Français	\N	validee	\N	\N
290	Bryant	Kobe	Basketteur/Basketteuse	1978-08-23	2020-01-26	Américain	\N	validee	\N	\N
291	Lepaul	Fabrice	Footballeur/Footballeuse	1976-11-17	2020-05-23	Français	\N	validee	\N	\N
292	Bedos	Guy	Humoriste	1934-06-15	2020-05-28	Français	\N	validee	\N	\N
293	Cordy	Annie	Cycliste	1928-06-16	2020-09-04	Belge	\N	validee	\N	\N
294	Connery	Sean	Nageur/Nageuse	1930-08-25	2020-10-31	Irlandaise	\N	validee	\N	\N
295	Carel	Roger	Acteur/Actrice	1927-08-14	2020-11-11	Français	\N	validee	\N	\N
296	Dominici	Christophe	Rugbyman/Rugbywoman	1972-05-20	2020-11-24	Français	\N	validee	\N	\N
297	Cellier	Caroline	Acteur/Actrice	1945-08-07	2020-12-15	Française	\N	validee	\N	\N
298	Brasseur	Claude	Réalisateur/Réalisatrice	1936-06-15	2020-12-22	Américain	\N	validee	\N	\N
299	Diamond	Dustin	Rappeur/Rappeuse	1977-01-07	2021-02-01	Américain	\N	validee	\N	\N
300	Dupond	Patrick	Danseur/Danseuse	1959-03-14	2021-03-05	Français	\N	validee	\N	\N
301	Filipelli	Gérard	Chanteur/Chanteuse	1942-12-12	2021-03-30	Français	\N	validee	\N	\N
302	Juvet	Patrick	Chanteur/Chanteuse	1950-08-21	2021-04-01	Suisse	\N	validee	\N	\N
303	Rénier	Yves	Chanteur/Chanteuse	1942-09-29	2021-04-24	Suisse	\N	validee	\N	\N
309	Bujeau	Christian	Acteur/Actrice	1944-10-14	2026-05-01	Francais	\N	validee	4	\N
305	trump	Donald	Homme/Femme politique	1946-06-14	2026-01-15	Américain(e)	\N	validee	4	71
306	Potez	François	Ecrivain/Ecrivaine	\N	2026-02-20	Francais	\N	validee	4	\N
308	Macron	Emmanuel	Homme/Femme politique	1977-12-21	2026-06-15	Français(e)	\N	validee	4	72
310	Morin	Edgar	Ecrivain/Ecrivaine	1921-07-08	2026-05-01	Francais	\N	validee	4	32
311	Garnier	Simone	Animatrice TV	1931-12-25	2024-09-26	Française	Source : Wikipédia FR ; avis de décès (dansnoscoeurs.fr, lamaisondesobseques.fr) — Notes : Il s'agit de l'animatrice de télévision (co-animatrice d'Intervilles et Jeux sans frontières aux côtés de Guy Lux), née Simone Antoinette Garnier (Migné), et non une 'actrice météo'. Décédée le 26 septembre 2024.	validee	\N	\N
312	Khamenei	Ali (Sayyid Ali Hosseini)	Chef religieux / Homme politique (Guide suprême)	1939-04-19	2026-02-28	Iranien(ne)	Source : Al Jazeera, NPR, Wikipedia ("Assassination of Ali Khamenei") - multiples articles de presse du 28 février-1er mars 2026 — Notes : Guide suprême d'Iran depuis 1989, tué le 28 février 2026 lors de frappes aériennes israélo-américaines visant son bunker à Téhéran (au début de la « guerre d'Iran de 2026 »). Décès confirmé par le gouvernement iranien le 1er mars 2026. Son fils Mojtaba lui a succédé le 8 mars 2026.	validee	\N	\N
313	Bardot	Brigitte	Actrice	1934-09-28	2025-12-28	Française	Source : Franceinfo Culture, Fondation Brigitte Bardot (communiqué de décès) — Notes : Décédée à 91 ans à Saint-Tropez le 28 décembre 2025 ; inhumée le 7 janvier 2026 au cimetière marin.	validee	\N	\N
314	Greenspan	Alan	Économiste / ancien président de la Réserve fédérale (Homme d'affaires/institution financière)	1926-03-06	2026-06-22	Américain(e)	Source : NBC News, CNBC, CNN, Washington Post, Legacy.com (22 juin 2026) — Notes : Décédé le 22 juin 2026 à son domicile, à l'âge de 100 ans, des complications de la maladie de Parkinson. Ancien président de la Réserve fédérale américaine (1987-2006). Information bien recoupée par de multiples sources de presse fiables.	validee	\N	\N
315	Carter	Jimmy (James Earl Jr.)	Homme politique (ancien président des États-Unis)	1924-10-01	2024-12-29	Américain(e)	Source : National Archives / Wikipedia / presse (AP, PBS) — Notes : 39e président des États-Unis, décédé à 100 ans à son domicile de Plains, Géorgie, après des soins palliatifs.	validee	\N	\N
316	Law	Denis	Footballeur	1940-02-24	2025-01-17	Britannique (Écossais)	Source : Sky Sports / Manchester United (manutd.com) / Wikipedia — Notes : Légende de Manchester United et de l'équipe d'Écosse, décédé à 84 ans (avait annoncé publiquement une démence en 2021).	validee	\N	\N
317	Nolan	Linda (Linda Mary Monica)	Chanteuse/Actrice/Animatrice TV	1959-02-23	2025-01-15	Irlandaise (Britannique par résidence)	Source : ITV News / Wikipedia / Irish America — Notes : Membre du groupe The Nolans, décédée à 65 ans après une lutte de 20 ans contre le cancer du sein métastasé.	validee	\N	\N
318	Lovell	James Arthur Jr. (Jim)	Astronaute	1928-03-25	2025-08-07	Américain	Source : Washington Post, ABC7 Chicago, Hollywood Reporter, Wikipedia (Jim Lovell) — Notes : Commandant de la mission Apollo 13 (1970), incarné par Tom Hanks dans le film éponyme. Décédé le 7 août 2025 à son domicile de Lake Forest, Illinois, à 97 ans (complications d'une fracture de la hanche selon le coroner). Décès survenu avant la date du jour (02/07/2026), donc information factuelle et non une supposition future.	validee	\N	\N
\.


--
-- TOC entry 3518 (class 0 OID 16437)
-- Dependencies: 220
-- Data for Name: persons; Type: TABLE DATA; Schema: public; Owner: dc_user
--

COPY public.persons (id, nom, prenom, date_naissance, nationalite, categorie, description, is_alive, deceased_at, created_at, updated_at, created_by) FROM stdin;
\.


--
-- TOC entry 3522 (class 0 OID 16498)
-- Dependencies: 224
-- Data for Name: playerSelection; Type: TABLE DATA; Schema: public; Owner: dc_user
--

COPY public."playerSelection" (id, user_id, alive_person_id, created_at, points) FROM stdin;
3	4	71	2026-07-02 08:02:26.291103+00	\N
4	4	72	2026-07-02 08:09:20.301818+00	52
5	4	32	2026-07-02 17:56:46.214631+00	\N
\.


--
-- TOC entry 3524 (class 0 OID 24813)
-- Dependencies: 226
-- Data for Name: regles; Type: TABLE DATA; Schema: public; Owner: dc_user
--

COPY public.regles (id, code, nom, description, active, valeur) FROM stdin;
3	limite_selection	Limite de sélection	Nombre maximum de personnalités qu'un joueur peut sélectionner simultanément.	t	10
2	validation_admin	Validation administrateur obligatoire	Les personnalités proposées et les décès signalés par les joueurs doivent être validés par un administrateur avant d'être pris en compte.	t	\N
1	points_calcul	Calcul des points au décès	Attribue (100 - âge au décès, minimum 0) points à chaque joueur ayant sélectionné la personne, lors de la validation du décès.	t	\N
\.


--
-- TOC entry 3514 (class 0 OID 16386)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dc_user
--

COPY public.users (id, username, email, password_hash, role, created_at) FROM stdin;
1	admin	admin@local	$2a$10$QiHDhK.TwWCLZNdf8dvUTueL0KKgF5AbczBK03.Gu6lRHYKFCXb8C	admin	2026-07-02 05:45:27.333875+00
4	joueur	joueur@local	$2a$10$re4ZJrapId7GRtIkrkV5JOxsrCNQ4pzn7s9hDKzpjTO1.P2CsuAgG	joueur	2026-07-02 07:42:49.009408+00
20	DenisJoueur	den@toto.com	$2a$10$TWYZ.R2.K2cQ6Gebj6CgBOpyQr2v72K5TARW.o.mPLSb5Op1mDfTO	joueur	2026-07-02 08:05:53.400732+00
\.


--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 221
-- Name: alivePerson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dc_user
--

SELECT pg_catalog.setval('public."alivePerson_id_seq"', 256, true);


--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 217
-- Name: deathPerson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dc_user
--

SELECT pg_catalog.setval('public."deathPerson_id_seq"', 318, true);


--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 219
-- Name: persons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dc_user
--

SELECT pg_catalog.setval('public.persons_id_seq', 1, false);


--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 223
-- Name: playerSelection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dc_user
--

SELECT pg_catalog.setval('public."playerSelection_id_seq"', 5, true);


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 225
-- Name: regles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dc_user
--

SELECT pg_catalog.setval('public.regles_id_seq', 21, true);


--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dc_user
--

SELECT pg_catalog.setval('public.users_id_seq', 75, true);


--
-- TOC entry 3354 (class 2606 OID 16480)
-- Name: alivePerson alivePerson_pkey; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."alivePerson"
    ADD CONSTRAINT "alivePerson_pkey" PRIMARY KEY (id);


--
-- TOC entry 3350 (class 2606 OID 16435)
-- Name: deathPerson deathPerson_pkey; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."deathPerson"
    ADD CONSTRAINT "deathPerson_pkey" PRIMARY KEY (id);


--
-- TOC entry 3352 (class 2606 OID 16447)
-- Name: persons persons_pkey; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_pkey PRIMARY KEY (id);


--
-- TOC entry 3356 (class 2606 OID 16504)
-- Name: playerSelection playerSelection_pkey; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."playerSelection"
    ADD CONSTRAINT "playerSelection_pkey" PRIMARY KEY (id);


--
-- TOC entry 3358 (class 2606 OID 16506)
-- Name: playerSelection playerSelection_user_id_alive_person_id_key; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."playerSelection"
    ADD CONSTRAINT "playerSelection_user_id_alive_person_id_key" UNIQUE (user_id, alive_person_id);


--
-- TOC entry 3360 (class 2606 OID 24823)
-- Name: regles regles_code_key; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.regles
    ADD CONSTRAINT regles_code_key UNIQUE (code);


--
-- TOC entry 3362 (class 2606 OID 24821)
-- Name: regles regles_pkey; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.regles
    ADD CONSTRAINT regles_pkey PRIMARY KEY (id);


--
-- TOC entry 3346 (class 2606 OID 16394)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3348 (class 2606 OID 16396)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3369 (class 2620 OID 16453)
-- Name: persons persons_updated_at; Type: TRIGGER; Schema: public; Owner: dc_user
--

CREATE TRIGGER persons_updated_at BEFORE UPDATE ON public.persons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- TOC entry 3366 (class 2606 OID 16491)
-- Name: alivePerson alivePerson_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."alivePerson"
    ADD CONSTRAINT "alivePerson_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3363 (class 2606 OID 24773)
-- Name: deathPerson deathPerson_alive_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."deathPerson"
    ADD CONSTRAINT "deathPerson_alive_person_id_fkey" FOREIGN KEY (alive_person_id) REFERENCES public."alivePerson"(id) ON DELETE SET NULL;


--
-- TOC entry 3364 (class 2606 OID 16542)
-- Name: deathPerson deathPerson_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."deathPerson"
    ADD CONSTRAINT "deathPerson_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3365 (class 2606 OID 16448)
-- Name: persons persons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT persons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3367 (class 2606 OID 16512)
-- Name: playerSelection playerSelection_alive_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."playerSelection"
    ADD CONSTRAINT "playerSelection_alive_person_id_fkey" FOREIGN KEY (alive_person_id) REFERENCES public."alivePerson"(id) ON DELETE CASCADE;


--
-- TOC entry 3368 (class 2606 OID 16507)
-- Name: playerSelection playerSelection_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dc_user
--

ALTER TABLE ONLY public."playerSelection"
    ADD CONSTRAINT "playerSelection_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-07-02 23:20:14

--
-- PostgreSQL database dump complete
--

