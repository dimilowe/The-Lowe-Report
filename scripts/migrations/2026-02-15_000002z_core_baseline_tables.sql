-- Baseline tables for fresh local/dev databases.
-- Existing hosted databases already had these tables before tracked migrations began.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  price_type VARCHAR(20) NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0,
  thumbnail_url TEXT,
  download_url TEXT,
  external_url TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  unlisted BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  cluster_slug TEXT,
  is_indexed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entitlements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount NUMERIC(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_objects (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL,
  cluster_slug TEXT,
  pillar_slug TEXT,
  cloud_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  word_count INTEGER,
  health JSONB,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug, type)
);

CREATE TABLE IF NOT EXISTS tools (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  engine TEXT,
  cluster TEXT,
  segment TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  link_status TEXT DEFAULT 'Not Ready',
  is_indexed BOOLEAN NOT NULL DEFAULT FALSE,
  in_directory BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  blueprint_id TEXT,
  dimensions JSONB,
  link_rules JSONB,
  category TEXT,
  tags TEXT[],
  icon TEXT,
  icon_bg TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  is_mbb BOOLEAN NOT NULL DEFAULT FALSE,
  input_type TEXT,
  output_type TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  search_intent TEXT,
  pillar_slug TEXT,
  recommended_tools TEXT[],
  recommended_articles TEXT[],
  related_tools TEXT[],
  related_articles TEXT[],
  source TEXT NOT NULL DEFAULT 'manual',
  required_clouds TEXT[] NOT NULL DEFAULT '{}'::text[],
  required_tier TEXT NOT NULL DEFAULT 'free',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title TEXT,
  cms_slug TEXT,
  is_indexed BOOLEAN NOT NULL DEFAULT FALSE,
  canonical TEXT,
  notes TEXT,
  manual_review_passed BOOLEAN,
  is_ready_to_index BOOLEAN,
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_objects_type_slug ON cms_objects (type, slug);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools (slug);
CREATE INDEX IF NOT EXISTS idx_global_urls_url ON global_urls (url);
