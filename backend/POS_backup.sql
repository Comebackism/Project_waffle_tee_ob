--
-- PostgreSQL database dump
--

\restrict AAjAicON9MwH721cFO5BmSG2xfZQa5WBHHcfgLhX2EHBCA6zKF5Hol1gQqyQkE3

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Daily_Menu_Summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Daily_Menu_Summary" (
    summary_date date NOT NULL,
    menu_id character varying(20) NOT NULL,
    quantity_sold integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Daily_Menu_Summary" OWNER TO postgres;

--
-- Name: Daily_Summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Daily_Summary" (
    summary_id integer NOT NULL,
    summary_date date NOT NULL,
    total_orders integer DEFAULT 0 NOT NULL,
    total_sales numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Daily_Summary" OWNER TO postgres;

--
-- Name: Daily_Summary_summary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Daily_Summary_summary_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Daily_Summary_summary_id_seq" OWNER TO postgres;

--
-- Name: Daily_Summary_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Daily_Summary_summary_id_seq" OWNED BY public."Daily_Summary".summary_id;


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoice" (
    "InvoiceNo" character varying(20) NOT NULL,
    "InvDate" date DEFAULT CURRENT_DATE,
    "ProductId" character varying(10),
    "Weight" numeric(10,2) NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- Name: Menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Menu" (
    menu_id character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    "Picture" character varying(255),
    "Calories" numeric(10,2),
    description text,
    is_favorite boolean DEFAULT false
);


ALTER TABLE public."Menu" OWNER TO postgres;

--
-- Name: MenuComponent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MenuComponent" (
    menu_id character varying(10) NOT NULL,
    "ProductID" character varying(10) NOT NULL,
    "Weight" numeric(10,2) NOT NULL
);


ALTER TABLE public."MenuComponent" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    order_id character varying(20) NOT NULL,
    queue_number character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Status_id" character varying(10),
    user_id character varying(10),
    pay_method character varying(20),
    total_amount numeric(10,2),
    pay_time timestamp without time zone,
    slip_picture character varying(255),
    note character varying(255),
    total_calories integer DEFAULT 0
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: Order_Item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order_Item" (
    order_item_id character varying(30) NOT NULL,
    order_id character varying(20),
    menu_id character varying(10),
    quantity integer DEFAULT 1 NOT NULL,
    note character varying(255)
);


ALTER TABLE public."Order_Item" OWNER TO postgres;

--
-- Name: Order_Item_Topping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order_Item_Topping" (
    id integer NOT NULL,
    order_item_id character varying(30),
    topping_id character varying(10),
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Order_Item_Topping" OWNER TO postgres;

--
-- Name: Order_Item_Topping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_Item_Topping_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_Item_Topping_id_seq" OWNER TO postgres;

--
-- Name: Order_Item_Topping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_Item_Topping_id_seq" OWNED BY public."Order_Item_Topping".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    "ProductID" character varying(10) NOT NULL,
    "ProductName" character varying(100) NOT NULL,
    "Picture" text,
    category character varying(50) DEFAULT 'วัตถุดิบหลัก'::character varying
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Role" (
    "Role_id" character varying(10) NOT NULL,
    "RoleName" character varying(50) NOT NULL
);


ALTER TABLE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Status" (
    status_id character varying(10) NOT NULL,
    statusname character varying(50) NOT NULL
);


ALTER TABLE public."Status" OWNER TO postgres;

--
-- Name: Stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stock" (
    stock_id character varying(10) NOT NULL,
    "ProductID" character varying(10),
    quantity numeric(10,2) DEFAULT 0 NOT NULL,
    unit character varying(20),
    last_update timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Picture" text
);


ALTER TABLE public."Stock" OWNER TO postgres;

--
-- Name: Topping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Topping" (
    topping_id character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    "Picture" character varying(255),
    "Calories" numeric(10,2)
);


ALTER TABLE public."Topping" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    user_id character varying(10) NOT NULL,
    firstname character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(15),
    email character varying(100),
    "Role_id" character varying(10)
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Daily_Summary summary_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Daily_Summary" ALTER COLUMN summary_id SET DEFAULT nextval('public."Daily_Summary_summary_id_seq"'::regclass);


--
-- Name: Order_Item_Topping id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item_Topping" ALTER COLUMN id SET DEFAULT nextval('public."Order_Item_Topping_id_seq"'::regclass);


--
-- Data for Name: Daily_Menu_Summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Daily_Menu_Summary" (summary_date, menu_id, quantity_sold) FROM stdin;
2026-08-09	M02	5
2026-08-09	M03	1
2026-08-09	M01	4
2026-08-09	M04	1
\.


--
-- Data for Name: Daily_Summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Daily_Summary" (summary_id, summary_date, total_orders, total_sales, created_at) FROM stdin;
1	2026-08-09	10	979.00	2026-08-09 08:50:37.207719
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" ("InvoiceNo", "InvDate", "ProductId", "Weight") FROM stdin;
INV-20260809-001	2026-08-09	P01	5.00
INV-20260809-002	2026-08-09	P01	5.00
INV-20260809-003	2026-08-09	P04	10.00
\.


--
-- Data for Name: Menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Menu" (menu_id, name, price, is_active, "Picture", "Calories", description, is_favorite) FROM stdin;
M01	วาฟเฟิลฮ่องกง รสออริจินัล	45.00	t	/images/waffle_original.png	230.00	กรอบนอกนุ่มใน หอมหวาน	t
M02	วาฟเฟิลฮ่องกง รสช็อกโกแลต	50.00	t	/images/waffle_chocolate.png	250.00	เข้มข้นถึงรสช็อกโกแลต	t
M03	วาฟเฟิลฮ่องกง รสมัทฉะ	60.00	t	/images/waffle_matcha.png	220.00	หอมกลิ่นมัทฉะแท้	f
M04	วาฟเฟิลสตรอว์เบอร์รีครีมสด	69.00	t	/images/strawberry_waffle.png	450.00	วาฟเฟิลฮ่องกงกรอบนอกนุ่มใน สอดไส้ครีมสดและสตรอว์เบอร์รีฉ่ำๆ	f
\.


--
-- Data for Name: MenuComponent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MenuComponent" (menu_id, "ProductID", "Weight") FROM stdin;
M01	P01	100.00
M01	P03	1.00
M02	P01	100.00
M02	P02	20.00
M02	P03	1.00
M03	P01	100.00
M03	P03	1.00
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (order_id, queue_number, created_at, "Status_id", user_id, pay_method, total_amount, pay_time, slip_picture, note, total_calories) FROM stdin;
ORD-00002	#E002	2026-08-09 12:43:09.069585	S05	\N	cash	80.00	2026-08-09 13:06:24.417765	\N		450
ORD-00001	#E001	2026-08-09 12:42:54.789625	S05	\N	cash	70.00	2026-08-09 13:06:24.814137	\N		390
\.


--
-- Data for Name: Order_Item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order_Item" (order_item_id, order_id, menu_id, quantity, note) FROM stdin;
ORD-00001-I1	ORD-00001	M01	1	\N
ORD-00002-I1	ORD-00002	M01	1	\N
\.


--
-- Data for Name: Order_Item_Topping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order_Item_Topping" (id, order_item_id, topping_id, quantity) FROM stdin;
59	ORD-00001-I1	T01	1
60	ORD-00001-I1	T02	1
61	ORD-00002-I1	T01	1
62	ORD-00002-I1	T03	1
63	ORD-00002-I1	T04	1
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" ("ProductID", "ProductName", "Picture", category) FROM stdin;
P01	แป้งวาฟเฟิลสูตรพิเศษ	https://placehold.co/300x200?text=Flour	วัตถุดิบหลัก
P02	ช็อกโกแลตชิพ	https://placehold.co/300x200?text=Eggs	วัตถุดิบหลัก
P03	กล่องบรรจุภัณฑ์ (M)	https://placehold.co/300x200?text=Choco	วัตถุดิบหลัก
P04	ไข่ไก่สด (เบอร์ 2)	https://placehold.co/300x200?text=Almond	วัตถุดิบหลัก
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Role" ("Role_id", "RoleName") FROM stdin;
R01	Admin
R02	Cashier
R03	Kitchen
\.


--
-- Data for Name: Status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Status" (status_id, statusname) FROM stdin;
S01	รอชำระเงิน
S02	รอดำเนินการ
S03	กำลังปรุง
S04	พร้อมรับ
S05	เสร็จสิ้น
\.


--
-- Data for Name: Stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stock" (stock_id, "ProductID", quantity, unit, last_update, "Picture") FROM stdin;
ST03	P03	450.00	ชิ้น	2026-08-08 19:19:07.668129	\N
ST02	P02	5.50	กิโลกรัม	2026-08-09 09:01:41.393638	\N
ST01	P01	6.00	กิโลกรัม	2026-08-09 12:20:23.164782	\N
ST04	P04	500.00	ฟอง	2026-08-09 12:29:07.25764	\N
\.


--
-- Data for Name: Topping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Topping" (topping_id, name, price, is_active, "Picture", "Calories") FROM stdin;
T02	ฝอยทอง	15.00	t	\N	100.00
T03	ช็อกโกแลตชิพ	10.00	t	\N	70.00
T01	กล้วยหอม	10.00	t	\N	60.00
T04	อัลมอนด์	15.00	t	\N	90.00
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (user_id, firstname, lastname, username, password, phone, email, "Role_id") FROM stdin;
U04	วรวัฒน์	บุญเรือง	mzaba01	1234	\N	\N	R02
U01	สมชาย	เจ้าของร้าน	admin	1234	\N	\N	R01
U02	มาริสา	ยอดขยัน	cashier	1234	\N	\N	R02
U03	ยอดชาย	ใจดี	kitchen	1234	\N	\N	R03
\.


--
-- Name: Daily_Summary_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Daily_Summary_summary_id_seq"', 4, true);


--
-- Name: Order_Item_Topping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_Item_Topping_id_seq"', 63, true);


--
-- Name: Daily_Menu_Summary Daily_Menu_Summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Daily_Menu_Summary"
    ADD CONSTRAINT "Daily_Menu_Summary_pkey" PRIMARY KEY (summary_date, menu_id);


--
-- Name: Daily_Summary Daily_Summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Daily_Summary"
    ADD CONSTRAINT "Daily_Summary_pkey" PRIMARY KEY (summary_id);


--
-- Name: Daily_Summary Daily_Summary_summary_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Daily_Summary"
    ADD CONSTRAINT "Daily_Summary_summary_date_key" UNIQUE (summary_date);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("InvoiceNo");


--
-- Name: MenuComponent MenuComponent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuComponent"
    ADD CONSTRAINT "MenuComponent_pkey" PRIMARY KEY (menu_id, "ProductID");


--
-- Name: Menu Menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Menu"
    ADD CONSTRAINT "Menu_pkey" PRIMARY KEY (menu_id);


--
-- Name: Order_Item_Topping Order_Item_Topping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item_Topping"
    ADD CONSTRAINT "Order_Item_Topping_pkey" PRIMARY KEY (id);


--
-- Name: Order_Item Order_Item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item"
    ADD CONSTRAINT "Order_Item_pkey" PRIMARY KEY (order_item_id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (order_id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("ProductID");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("Role_id");


--
-- Name: Status Status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Status"
    ADD CONSTRAINT "Status_pkey" PRIMARY KEY (status_id);


--
-- Name: Stock Stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stock"
    ADD CONSTRAINT "Stock_pkey" PRIMARY KEY (stock_id);


--
-- Name: Topping Topping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Topping"
    ADD CONSTRAINT "Topping_pkey" PRIMARY KEY (topping_id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (user_id);


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: Daily_Menu_Summary Daily_Menu_Summary_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Daily_Menu_Summary"
    ADD CONSTRAINT "Daily_Menu_Summary_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public."Menu"(menu_id) ON DELETE CASCADE;


--
-- Name: Invoice Invoice_ProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES public."Product"("ProductID");


--
-- Name: MenuComponent MenuComponent_ProductID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuComponent"
    ADD CONSTRAINT "MenuComponent_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES public."Product"("ProductID");


--
-- Name: MenuComponent MenuComponent_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MenuComponent"
    ADD CONSTRAINT "MenuComponent_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public."Menu"(menu_id);


--
-- Name: Order_Item_Topping Order_Item_Topping_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item_Topping"
    ADD CONSTRAINT "Order_Item_Topping_order_item_id_fkey" FOREIGN KEY (order_item_id) REFERENCES public."Order_Item"(order_item_id) ON DELETE CASCADE;


--
-- Name: Order_Item_Topping Order_Item_Topping_topping_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item_Topping"
    ADD CONSTRAINT "Order_Item_Topping_topping_id_fkey" FOREIGN KEY (topping_id) REFERENCES public."Topping"(topping_id);


--
-- Name: Order_Item Order_Item_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item"
    ADD CONSTRAINT "Order_Item_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public."Menu"(menu_id);


--
-- Name: Order_Item Order_Item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order_Item"
    ADD CONSTRAINT "Order_Item_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Order"(order_id) ON DELETE CASCADE;


--
-- Name: Order Order_Status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_Status_id_fkey" FOREIGN KEY ("Status_id") REFERENCES public."Status"(status_id);


--
-- Name: Order Order_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(user_id);


--
-- Name: Stock Stock_ProductID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stock"
    ADD CONSTRAINT "Stock_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES public."Product"("ProductID");


--
-- Name: User User_Role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_Role_id_fkey" FOREIGN KEY ("Role_id") REFERENCES public."Role"("Role_id");


--
-- PostgreSQL database dump complete
--

\unrestrict AAjAicON9MwH721cFO5BmSG2xfZQa5WBHHcfgLhX2EHBCA6zKF5Hol1gQqyQkE3

