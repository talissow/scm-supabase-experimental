import subprocess
import os
import sys

print("INICIO", flush=True)

try:
    print(f"Python versao: {sys.version}", flush=True)
    print(f"CWD: {os.getcwd()}", flush=True)
    print(f"Pasta projeto existe: {os.path.exists('/vercel/share/v0-project')}", flush=True)
    print(f"Pasta .git existe: {os.path.exists('/vercel/share/v0-project/.git')}", flush=True)

    # Lista arquivos na pasta
    try:
        files = os.listdir('/vercel/share/v0-project')
        print(f"Arquivos raiz (primeiros 10): {files[:10]}", flush=True)
    except Exception as e:
        print(f"Erro ao listar: {e}", flush=True)

    # Tenta rodar git
    try:
        r = subprocess.run(['git', '--version'], capture_output=True, text=True)
        print(f"git --version: {r.stdout.strip()} | err: {r.stderr.strip()}", flush=True)
    except FileNotFoundError:
        print("git NAO ENCONTRADO no PATH!", flush=True)

    # Verifica PATH
    print(f"PATH: {os.environ.get('PATH', 'N/A')}", flush=True)

    # Tenta git status
    try:
        r = subprocess.run(
            ['git', 'status'],
            capture_output=True, text=True,
            cwd='/vercel/share/v0-project'
        )
        print(f"git status stdout: {r.stdout[:500]}", flush=True)
        print(f"git status stderr: {r.stderr[:500]}", flush=True)
        print(f"git status code: {r.returncode}", flush=True)
    except Exception as e:
        print(f"Erro no git status: {e}", flush=True)

    # Tenta git remote
    try:
        r = subprocess.run(
            ['git', 'remote', '-v'],
            capture_output=True, text=True,
            cwd='/vercel/share/v0-project'
        )
        print(f"git remote: {r.stdout.strip()}", flush=True)
    except Exception as e:
        print(f"Erro git remote: {e}", flush=True)

    # Tenta git add e commit
    try:
        subprocess.run(['git', 'add', '-A'], cwd='/vercel/share/v0-project', capture_output=True)
        r = subprocess.run(
            ['git', 'commit', '-m', 'FASE 4: React redesign completo\n\nCo-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>'],
            capture_output=True, text=True,
            cwd='/vercel/share/v0-project'
        )
        print(f"git commit stdout: {r.stdout.strip()}", flush=True)
        print(f"git commit stderr: {r.stderr.strip()}", flush=True)
        print(f"git commit code: {r.returncode}", flush=True)
    except Exception as e:
        print(f"Erro no commit: {e}", flush=True)

    # Tenta push
    try:
        r = subprocess.run(
            ['git', 'push', 'origin', 'progresso-do-projeto'],
            capture_output=True, text=True,
            cwd='/vercel/share/v0-project'
        )
        print(f"git push stdout: {r.stdout.strip()}", flush=True)
        print(f"git push stderr: {r.stderr.strip()}", flush=True)
        print(f"git push code: {r.returncode}", flush=True)
    except Exception as e:
        print(f"Erro no push: {e}", flush=True)

except Exception as e:
    print(f"ERRO GERAL: {type(e).__name__}: {e}", flush=True)

print("FIM", flush=True)
