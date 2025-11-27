--
-- PostgreSQL database dump
--

\restrict 3aA52zisZovJemDrIPa6aFOc9ex2QBneIncoCfjpNEykdNuoNTwbzzF4TqvLTek

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    current_balance numeric(19,2) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT accounts_type_check CHECK (((type)::text = ANY ((ARRAY['CHEQUING'::character varying, 'SAVINGS'::character varying, 'CREDIT_CARD'::character varying])::text[])))
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    is_active boolean NOT NULL,
    monthly_limit numeric(19,2) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    is_default boolean NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid,
    CONSTRAINT categories_type_check CHECK (((type)::text = ANY ((ARRAY['EXPENSE'::character varying, 'INCOME'::character varying])::text[])))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categorization_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorization_rules (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    keyword character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid
);


ALTER TABLE public.categorization_rules OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    data_json text,
    message text NOT NULL,
    read boolean NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['BUDGET_THRESHOLD'::character varying, 'GOAL_REACHED'::character varying, 'GENERAL'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: savings_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.savings_goals (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    current_amount numeric(19,2) NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    target_amount numeric(19,2) NOT NULL,
    target_date date,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT savings_goals_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.savings_goals OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    account_id uuid NOT NULL,
    amount numeric(19,2) NOT NULL,
    category_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    date timestamp(6) without time zone NOT NULL,
    description character varying(255) NOT NULL,
    merchant_name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['DEBIT'::character varying, 'CREDIT'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    preferred_currency character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    theme_preference character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['USER'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT users_theme_preference_check CHECK (((theme_preference)::text = ANY ((ARRAY['LIGHT'::character varying, 'DARK'::character varying, 'SYSTEM'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, created_at, current_balance, name, type, updated_at, user_id) FROM stdin;
8a5c1236-ce07-49d3-9608-f4c2af5087e6	2025-11-15 14:36:27.219569	5000.00	High Interest Savings	SAVINGS	2025-11-15 14:36:27.219569	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	2025-11-15 14:36:27.207475	8776.95	Everyday Chequing	CHEQUING	2025-11-15 14:36:27.380911	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
cbab5450-fa21-4362-80f4-8954ea209fea	2025-11-23 22:50:06.778697	4974.00	Visa	CHEQUING	2025-11-23 22:51:09.14984	55bb09f8-4e4d-4a1d-b597-a1ede74adff9
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.budgets (id, category_id, created_at, is_active, monthly_limit, updated_at, user_id) FROM stdin;
571b2a0f-3ded-4e61-8679-b5139ffb4eb7	f2470cac-dd0f-4c23-bb3e-a6b2888bc319	2025-11-15 14:36:27.223643	t	400.00	2025-11-15 14:36:27.223643	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
5c832658-8377-4cb8-a93b-303b932e52c1	0d89c818-4aa9-45fe-b490-5b6cff0f98e1	2025-11-15 14:36:27.234124	t	200.00	2025-11-15 14:36:27.234124	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
dc5c9e1b-4335-474e-8b84-2041f6d5d1b9	733d9026-46a7-4036-bd94-7f7caafaf18c	2025-11-15 14:36:27.237124	t	300.00	2025-11-15 14:36:27.237124	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
974cfe70-cb6f-4738-b0bb-84a598b12e45	10e6a40f-c621-45e8-8c6d-e5100411e95c	2025-11-15 14:36:27.242365	t	150.00	2025-11-15 14:36:27.242365	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, created_at, is_default, name, type, updated_at, user_id) FROM stdin;
f2470cac-dd0f-4c23-bb3e-a6b2888bc319	2025-11-15 14:36:27.136935	t	Groceries	EXPENSE	2025-11-15 14:36:27.136935	\N
0d89c818-4aa9-45fe-b490-5b6cff0f98e1	2025-11-15 14:36:27.14693	t	Transport	EXPENSE	2025-11-15 14:36:27.14693	\N
733d9026-46a7-4036-bd94-7f7caafaf18c	2025-11-15 14:36:27.149959	t	Bills	EXPENSE	2025-11-15 14:36:27.149959	\N
10e6a40f-c621-45e8-8c6d-e5100411e95c	2025-11-15 14:36:27.151968	t	Shopping	EXPENSE	2025-11-15 14:36:27.151968	\N
43f46163-2f36-4d46-993c-9e469e8f088e	2025-11-15 14:36:27.15497	t	Entertainment	EXPENSE	2025-11-15 14:36:27.15497	\N
abbdafb6-351b-4186-b494-bc69f62e5b6f	2025-11-15 14:36:27.157969	t	Rent	EXPENSE	2025-11-15 14:36:27.157969	\N
72861bf1-31b0-4e9a-b5d9-859d410ee251	2025-11-15 14:36:27.160969	t	Salary	INCOME	2025-11-15 14:36:27.160969	\N
0254a7a1-73ca-45f2-83b3-4c726bca82f0	2025-11-15 14:36:27.163677	t	Misc	EXPENSE	2025-11-15 14:36:27.163677	\N
\.


--
-- Data for Name: categorization_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorization_rules (id, category_id, created_at, keyword, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, created_at, data_json, message, read, title, type, user_id) FROM stdin;
\.


--
-- Data for Name: savings_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.savings_goals (id, created_at, current_amount, name, status, target_amount, target_date, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, account_id, amount, category_id, created_at, date, description, merchant_name, type, updated_at, user_id) FROM stdin;
b9371341-221c-4e0e-8258-008f1b052fe9	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	85.50	f2470cac-dd0f-4c23-bb3e-a6b2888bc319	2025-11-15 14:36:27.246049	2025-11-05 14:30:00	Grocery shopping	Loblaws	DEBIT	2025-11-15 14:36:27.246049	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
0b10f4c0-ca80-466c-ba77-c5b02eea614f	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	45.00	0d89c818-4aa9-45fe-b490-5b6cff0f98e1	2025-11-15 14:36:27.292103	2025-11-08 09:15:00	Uber ride	Uber	DEBIT	2025-11-15 14:36:27.292103	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
c26c22ec-ff3b-4abb-a6b1-2bf6834a7704	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	120.00	733d9026-46a7-4036-bd94-7f7caafaf18c	2025-11-15 14:36:27.301349	2025-11-10 00:00:00	Electricity bill	Hydro One	DEBIT	2025-11-15 14:36:27.301349	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
e97eb4c2-3eee-423d-b35b-167248962718	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	75.25	10e6a40f-c621-45e8-8c6d-e5100411e95c	2025-11-15 14:36:27.310816	2025-11-12 16:45:00	Clothing purchase	H&M	DEBIT	2025-11-15 14:36:27.310816	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
cf6825b4-af48-47b9-91e5-50464f0ff8b0	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	35.00	43f46163-2f36-4d46-993c-9e469e8f088e	2025-11-15 14:36:27.318872	2025-11-15 19:30:00	Movie tickets	Cineplex	DEBIT	2025-11-15 14:36:27.318872	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
39b840f3-88c6-4fb0-93ff-2195c2ec2dc8	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	3500.00	72861bf1-31b0-4e9a-b5d9-859d410ee251	2025-11-15 14:36:27.328689	2025-11-01 00:00:00	Monthly salary	Employer	CREDIT	2025-11-15 14:36:27.328689	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
8017a80c-538a-4c57-b4e1-d5db48c055ee	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	92.30	f2470cac-dd0f-4c23-bb3e-a6b2888bc319	2025-11-15 14:36:27.337317	2025-10-03 15:00:00	Grocery shopping	Metro	DEBIT	2025-11-15 14:36:27.337317	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
71d1956c-fda2-4b20-8946-709de87f765c	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	50.00	0d89c818-4aa9-45fe-b490-5b6cff0f98e1	2025-11-15 14:36:27.346926	2025-10-07 08:00:00	Gas station	Shell	DEBIT	2025-11-15 14:36:27.346926	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
d9de9b6d-7d09-4a76-bb52-b147868e603d	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	95.00	733d9026-46a7-4036-bd94-7f7caafaf18c	2025-11-15 14:36:27.356367	2025-10-12 00:00:00	Internet bill	Rogers	DEBIT	2025-11-15 14:36:27.356367	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
a18820af-57d1-48cd-8e4c-fd20db0fad30	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	125.00	10e6a40f-c621-45e8-8c6d-e5100411e95c	2025-11-15 14:36:27.364481	2025-10-18 10:00:00	Online purchase	Amazon	DEBIT	2025-11-15 14:36:27.364481	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
b0fb3305-ba7a-406e-bca5-857bb34a57e4	f4b03882-d9d5-45ae-b1da-8f3ac23bc50c	3500.00	72861bf1-31b0-4e9a-b5d9-859d410ee251	2025-11-15 14:36:27.375021	2025-10-01 00:00:00	Monthly salary	Employer	CREDIT	2025-11-15 14:36:27.375021	86fc9ba6-1499-4c43-bbe9-e498ebe8fa26
1fa6c0e0-053c-4ccc-b6da-773a084119b0	cbab5450-fa21-4362-80f4-8954ea209fea	12.00	\N	2025-11-23 22:50:29.030972	2025-11-24 00:00:00	Cookies	Crumbl Cookies	DEBIT	2025-11-23 22:50:29.030972	55bb09f8-4e4d-4a1d-b597-a1ede74adff9
6194f536-20ed-442a-9695-880b90048010	cbab5450-fa21-4362-80f4-8954ea209fea	14.00	\N	2025-11-23 22:51:09.143463	2025-11-24 00:00:00	fw	Crumbl Cookies	DEBIT	2025-11-23 22:51:09.143463	55bb09f8-4e4d-4a1d-b597-a1ede74adff9
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, created_at, email, name, password_hash, preferred_currency, role, theme_preference, updated_at) FROM stdin;
67124120-051d-4e87-96f6-a24df914f70f	2025-11-15 14:36:26.871326	admin@example.com	Admin User	$2a$10$6QkLP2QUzxMejzYJCgSab.xO.tubTEs/M333Ligim5i.vbqn772AC	CAD	ADMIN	SYSTEM	2025-11-15 14:36:26.871326
86fc9ba6-1499-4c43-bbe9-e498ebe8fa26	2025-11-15 14:36:27.132795	demo@example.com	Demo User	$2a$10$QqI.TivGZZ0H63IhObgIpeXUCPRvN6rFjxVunhf1haLonqrSmxxVW	CAD	USER	SYSTEM	2025-11-15 14:36:27.132795
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categorization_rules categorization_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorization_rules
    ADD CONSTRAINT categorization_rules_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: savings_goals savings_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.savings_goals
    ADD CONSTRAINT savings_goals_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict 3aA52zisZovJemDrIPa6aFOc9ex2QBneIncoCfjpNEykdNuoNTwbzzF4TqvLTek

