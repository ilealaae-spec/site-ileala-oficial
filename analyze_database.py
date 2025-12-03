#!/usr/bin/env python3
"""
Script para analisar o schema do banco de dados Neon
"""
import json

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("ERROR: psycopg2 not installed. Using alternative method...")
    import subprocess
    import sys
    sys.exit(1)

# Connection string
DATABASE_URL = "postgresql://neondb_owner:npg_z73MLTX1JCin@ep-snowy-rice-ada9q7p8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

def analyze_database():
    """Analisa o schema do banco de dados"""
    try:
        # Conectar ao banco
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("=" * 80)
        print("ANÁLISE DO BANCO DE DADOS NEON - ILE ALA")
        print("=" * 80)
        print()
        
        # Listar todas as tabelas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        
        print(f"📊 TABELAS ENCONTRADAS: {len(tables)}")
        print("-" * 80)
        
        for table in tables:
            table_name = table['table_name']
            print(f"\n🗂️  Tabela: {table_name}")
            
            # Contar registros
            cur.execute(f"SELECT COUNT(*) as count FROM {table_name};")
            count = cur.fetchone()['count']
            print(f"   Registros: {count}")
            
            # Listar colunas
            cur.execute(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = '{table_name}'
                ORDER BY ordinal_position;
            """)
            columns = cur.fetchall()
            
            print(f"   Colunas ({len(columns)}):")
            for col in columns:
                nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
                default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
                print(f"     - {col['column_name']}: {col['data_type']} {nullable}{default}")
        
        print()
        print("=" * 80)
        print("✅ ANÁLISE CONCLUÍDA")
        print("=" * 80)
        
        # Fechar conexão
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ ERRO: {e}")
        return False
    
    return True

if __name__ == "__main__":
    analyze_database()
