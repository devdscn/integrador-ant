


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_admin_profiles"() RETURNS TABLE("id" "uuid", "apelido" character varying, "nome" character varying, "role" "text", "telefone" character varying, "created_at" timestamp with time zone, "email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT 
    p.id,
    p.apelido,
    p.nome,
    p.role,
    p.telefone,
    p.created_at,
    u.email -- Coluna do JOIN
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id -- Seu JOIN SQL
  WHERE
    -- Lógica HIERÁRQUICA: Filtra quem pode ver o quê (ESSENCIAL PARA SEGURANÇA)
    (auth.uid() = p.id) -- O próprio usuário
    OR
    (public.get_user_role() = 'admin') -- Admin vê tudo
    OR
    (public.get_user_role() = 'moderator' AND p.role = 'user') -- Moderator vê users
  ORDER BY p.created_at DESC;
$$;


ALTER FUNCTION "public"."get_admin_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "apelido" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "telefone" "text" NOT NULL,
    "endereco" "text",
    "numero" "text",
    "bairro" "text",
    "cidade" "text",
    "uf" "text",
    "cep" "text",
    "cpf" "text",
    "cnh" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    CONSTRAINT "check_user_role" CHECK (("role" = ANY (ARRAY['admin'::"text", 'moderator'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."profile_with_email" AS
 SELECT "p"."id",
    "p"."created_at",
    "p"."updated_at",
    "p"."apelido",
    "p"."nome",
    "p"."telefone",
    "p"."endereco",
    "p"."numero",
    "p"."bairro",
    "p"."cidade",
    "p"."uf",
    "p"."cep",
    "p"."cpf",
    "p"."cnh",
    "p"."role",
    "u"."email"
   FROM ("public"."profiles" "p"
     LEFT JOIN "auth"."users" "u" ON (("p"."id" = "u"."id")));


ALTER VIEW "public"."profile_with_email" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_apelido_key" UNIQUE ("apelido");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "profiles_apelido_idx" ON "public"."profiles" USING "btree" ("apelido");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "RLS: Acesso total baseado na hierarquia de roles" ON "public"."profiles" USING ((("auth"."uid"() = "id") OR (("public"."get_user_role"() = ANY (ARRAY['admin'::"text", 'moderator'::"text"])) AND ("role" = 'user'::"text")) OR ("public"."get_user_role"() = 'admin'::"text"))) WITH CHECK ((("auth"."uid"() = "id") OR (("public"."get_user_role"() = ANY (ARRAY['admin'::"text", 'moderator'::"text"])) AND ("role" = 'user'::"text")) OR ("public"."get_user_role"() = 'admin'::"text")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_admin_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";


















GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profile_with_email" TO "anon";
GRANT ALL ON TABLE "public"."profile_with_email" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_with_email" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;

