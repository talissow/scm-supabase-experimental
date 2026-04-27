import subprocess
import os
import sys

def run(cmd):
    print(f"\n[v0] Executando: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd="/vercel/share/v0-project")
    print(f"[v0] STDOUT: {result.stdout.strip() or '(vazio)'}")
    print(f"[v0] STDERR: {result.stderr.strip() or '(vazio)'}")
    print(f"[v0] Exit code: {result.returncode}")
    return result

print("[v0] === DIAGNOSTICO GIT INICIADO ===")
print(f"[v0] Python: {sys.version}")
print(f"[v0] CWD: {os.getcwd()}")

# Verifica se git existe
run("which git")
run("git --version")

# Verifica status do repo
run("git status")

# Verifica remote
run("git remote -v")

# Verifica branch atual
run("git branch --show-current")

# Verifica se tem arquivos novos
run("git status --short")

# Tenta adicionar arquivos
r = run("git add -A")
if r.returncode != 0:
    print("[v0] ERRO ao dar git add")
    sys.exit(1)

# Tenta commit
r = run('git commit -m "FASE 4 COMPLETO: Redesign React profissional com Next.js, Tailwind, Supabase"')
print(f"[v0] Commit resultado: {r.returncode}")

# Verifica se tem commits para fazer push
run("git log --oneline -5")

# Tenta push
r = run("git push origin progresso-do-projeto")
if r.returncode == 0:
    print("\n[v0] === PUSH FEITO COM SUCESSO! ===")
else:
    print(f"\n[v0] === FALHOU NO PUSH, tentando HEAD ===")
    r2 = run("git push")
    if r2.returncode == 0:
        print("[v0] Push com HEAD funcionou!")
    else:
        print("[v0] Ambos falharam. Verificando credenciais...")
        run("git config --list | grep -i url")
        run("git config --list | grep -i credential")

print("\n[v0] === DIAGNOSTICO CONCLUIDO ===")
