import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const CWD = '/vercel/share/v0-project';

function run(cmd) {
  console.log(`\n[v0] Executando: ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: CWD, encoding: 'utf8', stdio: 'pipe' });
    console.log(`[v0] OK: ${out.trim() || '(sem output)'}`);
    return { ok: true, out };
  } catch (e) {
    console.log(`[v0] ERRO stdout: ${e.stdout?.trim() || '(vazio)'}`);
    console.log(`[v0] ERRO stderr: ${e.stderr?.trim() || '(vazio)'}`);
    console.log(`[v0] Exit code: ${e.status}`);
    return { ok: false, err: e };
  }
}

console.log('[v0] === DIAGNOSTICO GIT INICIADO ===');
console.log(`[v0] CWD existe: ${existsSync(CWD)}`);

// 1. Verificações básicas
run('git --version');
run('git remote -v');
run('git branch --show-current');
run('git status --short');
run('git log --oneline -3');

// 2. Stage e commit
run('git add -A');
run('git commit -m "FASE 4 COMPLETO: Redesign React profissional" || echo "Nada para commitar"');

// 3. Push
console.log('\n[v0] === TENTANDO PUSH ===');
const push = run('git push origin progresso-do-projeto 2>&1');

if (push.ok) {
  console.log('[v0] PUSH SUCESSO!');
} else {
  console.log('[v0] Push falhou. Verificando config de auth...');
  run('git config --list');
  run('cat /vercel/share/v0-project/.git/config');
}

console.log('\n[v0] === FIM DIAGNOSTICO ===');
