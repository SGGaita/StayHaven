SET statement_timeout TO 0;
SET lock_timeout TO 0;
SET idle_in_transaction_session_timeout TO 0;
SET client_encoding TO 'UTF8';
SET standard_conforming_strings TO on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies TO false;
SET xmloption TO content;
SET client_min_messages TO warning;
SET row_security TO off;

--
-- TOC entry 866 (class 1247 OID 35210)
-- Name: PropertyStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PropertyStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'MAINTENANCE',
    'ARCHIVED'
);

--
-- TOC entry 5 (class 2615 OID 35200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it

--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';

// ... existing code ... 