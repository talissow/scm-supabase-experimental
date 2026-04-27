#!/usr/bin/env python3
import subprocess
import os
import sys
from datetime import datetime

def run_command(cmd, description):
    """Executa um comando e mostra o resultado"""
    print(f"\n{'='*60}")
    print(f"▶ {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd="/vercel/share/v0-project")
        if result.returncode == 0:
            print(f"✅ Sucesso!")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ Erro!")
            if result.stderr:
                print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Erro ao executar: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("🚀 INICIANDO DEPLOY PARA VERCEL E GITHUB")
    print("="*60)
    
    os.chdir("/vercel/share/v0-project")
    
    # 1. Verificar status do git
    print("\n📊 Verificando status do repositório...")
    subprocess.run("git status", shell=True, cwd="/vercel/share/v0-project")
    
    # 2. Configurar git user (se necessário)
    print("\n⚙️ Configurando Git...")
    subprocess.run('git config user.email "v0[bot]@users.noreply.github.com"', shell=True, cwd="/vercel/share/v0-project")
    subprocess.run('git config user.name "v0[bot]"', shell=True, cwd="/vercel/share/v0-project")
    
    # 3. Adicionar todos os arquivos
    if not run_command("git add -A", "Adicionando todos os arquivos"):
        return False
    
    # 4. Fazer commit
    commit_msg = f"FASE 4 COMPLETO: Redesign React com componentes profissionais, animações e deploy ready - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    if not run_command(f'git commit -m "{commit_msg}" --allow-empty', "Commitando alterações"):
        return False
    
    # 5. Push para GitHub
    if not run_command("git push origin progresso-do-projeto", "Fazendo push para GitHub"):
        return False
    
    print("\n" + "="*60)
    print("✅ PUSH PARA GITHUB CONCLUÍDO!")
    print("="*60)
    print("\n📍 Seu código agora está em:")
    print("   https://github.com/talissow/scm-supabase-experimental/tree/progresso-do-projeto")
    print("\n⏳ Vercel deve detectar automaticamente o push e iniciar o build...")
    print("   https://vercel.com/talissow/scm-supabase")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
