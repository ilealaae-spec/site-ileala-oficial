# Schema do Banco de Dados - Ile Ala

## Análise baseada nas migrações Drizzle

---

## 📊 TABELAS EXISTENTES

### 1. **users** - Usuários do sistema
```sql
- id (SERIAL PRIMARY KEY)
- openId (VARCHAR 64, UNIQUE)
- name (TEXT)
- email (VARCHAR 320, NOT NULL, UNIQUE)
- password (VARCHAR 255)
- phone (VARCHAR 50)
- address (TEXT)
- city (VARCHAR 100)
- state (VARCHAR 100)
- poBox (VARCHAR 50)
- country (VARCHAR 100)
- emailVerified (INTEGER, DEFAULT 0)
- emailVerificationToken (VARCHAR 255)
- emailVerificationExpires (TIMESTAMP)
- passwordResetToken (VARCHAR 255)
- passwordResetExpires (TIMESTAMP)
- loginMethod (VARCHAR 64)
- role (VARCHAR 20, DEFAULT 'user')
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())
- lastSignedIn (TIMESTAMP, DEFAULT NOW())
```

### 2. **products** - Produtos da loja
```sql
- id (SERIAL PRIMARY KEY)
- slug (VARCHAR 255, NOT NULL, UNIQUE)
- name (VARCHAR 255, NOT NULL)
- nameEN (VARCHAR 255, NOT NULL)
- namePT (VARCHAR 255, NOT NULL)
- descriptionEN (TEXT)
- descriptionPT (TEXT)
- price (INTEGER, NOT NULL)
- imageUrl (VARCHAR 512)
- collection (VARCHAR 100)
- category (VARCHAR 100)
- stock (INTEGER, DEFAULT 0)
- featured (INTEGER, DEFAULT 0)
- active (INTEGER, DEFAULT 1)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())

-- Campos adicionados na migração 0010:
- mainImage (VARCHAR 512)
- mainImageAlt (VARCHAR 255)
- images (TEXT) -- JSON array de imagens
- salePrice (INTEGER)
- descriptionEN_full (TEXT)
- descriptionPT_full (TEXT)
- material (VARCHAR 255)
- dimensions (VARCHAR 255)
- colors (VARCHAR 255)
- careInstructionsEN (TEXT)
- careInstructionsPT (TEXT)
- weight (DECIMAL 10,2)
- sku (VARCHAR 100)
- inStock (INTEGER, DEFAULT 1)
- stockQuantity (INTEGER)
- isNew (INTEGER, DEFAULT 0)
- onSale (INTEGER, DEFAULT 0)
- seoTitle (VARCHAR 255)
- seoDescription (TEXT)
```

### 3. **collections** - Coleções de produtos
```sql
- id (SERIAL PRIMARY KEY)
- slug (VARCHAR 255, NOT NULL, UNIQUE)
- nameEN (VARCHAR 255, NOT NULL)
- namePT (VARCHAR 255, NOT NULL)
- descriptionEN (TEXT)
- descriptionPT (TEXT)
- imageUrl (VARCHAR 512)
- displayOrder (INTEGER, DEFAULT 0)
- active (INTEGER, DEFAULT 1)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())

INDEX: collections_slug_idx
```

### 4. **categories** - Categorias de produtos
```sql
- id (SERIAL PRIMARY KEY)
- slug (VARCHAR 255, NOT NULL, UNIQUE)
- nameEN (VARCHAR 255, NOT NULL)
- namePT (VARCHAR 255, NOT NULL)
- descriptionEN (TEXT)
- descriptionPT (TEXT)
- imageUrl (VARCHAR 512)
- parentId (INTEGER, REFERENCES categories(id))
- displayOrder (INTEGER, DEFAULT 0)
- active (INTEGER, DEFAULT 1)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())

INDEX: categories_slug_idx
```

### 5. **artisans** - Artesãos
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255, NOT NULL)
- bio (TEXT)
- bioEN (TEXT)
- bioPT (TEXT)
- photoUrl (VARCHAR 512)
- specialty (VARCHAR 255)
- location (VARCHAR 255)
- email (VARCHAR 320)
- phone (VARCHAR 50)
- socialMedia (TEXT) -- JSON
- featured (INTEGER, DEFAULT 0)
- active (INTEGER, DEFAULT 1)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())

INDEX: artisans_featured_idx, artisans_active_idx
```

### 6. **media** - Biblioteca de mídia
```sql
- id (SERIAL PRIMARY KEY)
- filename (VARCHAR 255, NOT NULL)
- originalName (VARCHAR 255, NOT NULL)
- url (VARCHAR 512, NOT NULL)
- mimeType (VARCHAR 100, NOT NULL)
- size (INTEGER, NOT NULL)
- alt (VARCHAR 255)
- caption (TEXT)
- folder (VARCHAR 255, DEFAULT 'general')
- uploadedBy (INTEGER, REFERENCES users(id))
- createdAt (TIMESTAMP, DEFAULT NOW())

INDEX: media_folder_idx
```

### 7. **siteContent** - Conteúdo do site
```sql
- id (SERIAL PRIMARY KEY)
- key (VARCHAR 255, NOT NULL, UNIQUE)
- contentType (VARCHAR 50, NOT NULL)
- contentEN (TEXT)
- contentPT (TEXT)
- metadata (TEXT) -- JSON
- active (INTEGER, DEFAULT 1)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())

INDEX: siteContent_key_idx, siteContent_active_idx
```

### 8. **siteSettings** - Configurações do site
```sql
- id (SERIAL PRIMARY KEY)
- key (VARCHAR 255, NOT NULL, UNIQUE)
- value (TEXT, NOT NULL)
- description (TEXT)
- category (VARCHAR 100, DEFAULT 'general')
- updatedAt (TIMESTAMP, DEFAULT NOW())

INDEX: siteSettings_key_idx, siteSettings_category_idx
```

### 9. **orders** - Pedidos
```sql
- id (SERIAL PRIMARY KEY)
- userId (INTEGER, REFERENCES users(id))
- status (VARCHAR 20, DEFAULT 'pending')
- totalAmount (INTEGER, NOT NULL)
- shippingAddress (TEXT)
- customerName (VARCHAR 255)
- customerEmail (VARCHAR 320)
- customerPhone (VARCHAR 50)
- paymentStatus (VARCHAR 20, DEFAULT 'pending')
- paymentIntentId (VARCHAR 255)
- couponCode (VARCHAR 50)
- discountAmount (INTEGER, DEFAULT 0)
- notes (TEXT)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())
```

### 10. **orderItems** - Itens dos pedidos
```sql
- id (SERIAL PRIMARY KEY)
- orderId (INTEGER, REFERENCES orders(id), NOT NULL)
- productId (INTEGER, REFERENCES products(id), NOT NULL)
- quantity (INTEGER, NOT NULL)
- priceAtPurchase (INTEGER, NOT NULL)
- createdAt (TIMESTAMP, DEFAULT NOW())
```

### 11. **cartItems** - Itens do carrinho
```sql
- id (SERIAL PRIMARY KEY)
- userId (INTEGER, REFERENCES users(id), NOT NULL)
- productId (INTEGER, REFERENCES products(id), NOT NULL)
- quantity (INTEGER, NOT NULL)
- createdAt (TIMESTAMP, DEFAULT NOW())
- updatedAt (TIMESTAMP, DEFAULT NOW())
```

### 12. **coupons** - Cupons de desconto
```sql
- id (SERIAL PRIMARY KEY)
- code (VARCHAR 50, NOT NULL, UNIQUE)
- discountType (VARCHAR 20, NOT NULL)
- discountValue (INTEGER, NOT NULL)
- minPurchaseAmount (INTEGER, DEFAULT 0)
- maxUses (INTEGER, DEFAULT 0)
- usedCount (INTEGER, DEFAULT 0)
- active (INTEGER, DEFAULT 1)
- validFrom (TIMESTAMP, DEFAULT NOW())
- validUntil (TIMESTAMP)
- createdAt (TIMESTAMP, DEFAULT NOW())
```

### 13. **newsletter** - Newsletter
```sql
(Migração 0001 - detalhes não disponíveis no arquivo lido)
```

### 14. **auditLogs** - Logs de auditoria
```sql
(Migração 0006 - detalhes não disponíveis no arquivo lido)
```

### 15. **loginHistory** - Histórico de logins
```sql
(Migração 0008 - detalhes não disponíveis no arquivo lido)
```

### 16. **userSessions** - Sessões de usuários
```sql
(Migração 0009 - detalhes não disponíveis no arquivo lido)
```

---

## ✅ CONCLUSÃO

O banco de dados **JÁ ESTÁ PREPARADO** para funcionar sem o Sanity!

### Tabelas prontas para CMS próprio:
- ✅ **products** - Com todos os campos necessários
- ✅ **collections** - Para organizar produtos
- ✅ **categories** - Para categorização
- ✅ **artisans** - Para artesãos
- ✅ **media** - Para biblioteca de imagens
- ✅ **siteContent** - Para conteúdo dinâmico
- ✅ **siteSettings** - Para configurações

### O que falta:
1. **Popular as tabelas** com dados (migrar do Sanity ou criar novos)
2. **Criar API endpoints** para CRUD dessas tabelas
3. **Atualizar frontend** para usar o novo backend
4. **Remover código Sanity** do projeto
5. **Implementar upload** de imagens via Cloudinary

---

## 🎯 PRÓXIMO PASSO

Verificar se já existem dados nas tabelas ou se precisamos migrar do Sanity.
